import type { Express } from "express";
import { createServer, type Server } from "http";
import { connectMongoDB, isMongoConnected } from "./db/mongoose";
import { Pharmacy } from "./models/Pharmacy";
import { Dealer } from "./models/Dealer";
import { Medicine } from "./models/Medicine";
import { Inventory } from "./models/Inventory";
import { Conversation } from "./models/Conversation";
import { StockRequest } from "./models/StockRequest";
import { Offer } from "./models/Offer";
import { Personalization } from "./models/Personalization";
import { Schedule } from "./models/Schedule";
import OpenAI from "openai";

function getOpenAI(): OpenAI {
  const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OpenAI API key not configured. Set OPENAI_API_KEY in your .env file.");
  return new OpenAI({
    apiKey,
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  connectMongoDB().catch(() => {});

  function requireMongo(res: any): boolean {
    if (!isMongoConnected()) {
      res.status(503).json({ error: "Database not connected. Please add MONGODB_URI to secrets." });
      return false;
    }
    return true;
  }

  // ─── HEALTH CHECK ──────────────────────────────────────────────────
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", mongoConnected: isMongoConnected() });
  });

  // ─── DEBUG: LIST COLLECTIONS ─────────────────────────────────────
  app.get("/api/debug/collections", async (_req, res) => {
    if (!isMongoConnected()) return res.status(503).json({ error: "Not connected" });
    try {
      const { mongoose } = await import("./db/mongoose");
      const collections = await mongoose.connection.db!.listCollections().toArray();
      const result: Record<string, number> = {};
      for (const col of collections) {
        const count = await mongoose.connection.db!.collection(col.name).countDocuments();
        result[col.name] = count;
      }
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/debug/sample", async (req, res) => {
    if (!isMongoConnected()) return res.status(503).json({ error: "Not connected" });
    const col = req.query.col as string;
    if (!col) return res.status(400).json({ error: "col param required" });
    try {
      const { mongoose } = await import("./db/mongoose");
      const docs = await mongoose.connection.db!.collection(col).find({}).limit(2).toArray();
      res.json(docs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ─── DASHBOARD STATS ───────────────────────────────────────────────
  app.get("/api/stats", async (req, res) => {
    if (!isMongoConnected()) {
      return res.json({ pharmacies: 0, dealers: 0, conversations: 0, pendingOrders: 0, lowStock: 0, offers: 0, recentCalls: [], ordersByStatus: {}, inventoryByStatus: {}, topPharmacies: [] });
    }
    try {
      const [pharmacies, dealers, conversations, pendingOrders, offers] = await Promise.all([
        Pharmacy.countDocuments({}),
        Dealer.countDocuments({}),
        Conversation.countDocuments({}),
        StockRequest.countDocuments({ status: "Pending" }),
        Offer.countDocuments({ status: "Active" }),
      ]);
      const lowStock = await Inventory.countDocuments({ status: { $in: ["low_stock", "out_of_stock"] } });

      const [recentCalls, orderStatusAgg, inventoryStatusAgg, pharmacyCallAgg] = await Promise.all([
        Conversation.find({}).sort({ timestamp: -1 }).limit(5).lean(),
        StockRequest.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Inventory.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Conversation.aggregate([
          { $group: { _id: "$pharmacy_name", count: { $sum: 1 } } },
          { $match: { _id: { $ne: null } } },
          { $sort: { count: -1 } },
          { $limit: 6 },
        ]),
      ]);

      const ordersByStatus: Record<string, number> = {};
      for (const r of orderStatusAgg) if (r._id) ordersByStatus[r._id] = r.count;

      const inventoryByStatus: Record<string, number> = {};
      for (const r of inventoryStatusAgg) if (r._id) inventoryByStatus[r._id] = r.count;

      const topPharmacies = pharmacyCallAgg.map((r: any) => ({ name: r._id, count: r.count }));

      res.json({ pharmacies, dealers, conversations, pendingOrders, lowStock, offers, recentCalls, ordersByStatus, inventoryByStatus, topPharmacies });
    } catch (err) {
      console.error("Stats error:", err);
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ─── PHARMACIES (collection: pharmacists) ───────────────────────────
  app.get("/api/pharmacies", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const { search } = req.query;
      const filter: any = search ? { $or: [{ name: { $regex: search, $options: "i" } }, { location: { $regex: search, $options: "i" } }] } : {};
      const pharmacies = await Pharmacy.find(filter).sort({ name: 1 }).lean();
      res.json(pharmacies);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch pharmacies" });
    }
  });

  app.get("/api/pharmacies/:id", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const pharmacy = await Pharmacy.findById(req.params.id).lean();
      if (!pharmacy) return res.status(404).json({ error: "Pharmacy not found" });
      res.json(pharmacy);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch pharmacy" });
    }
  });

  app.post("/api/pharmacies", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const pharmacy = new Pharmacy(req.body);
      await pharmacy.save();
      res.status(201).json(pharmacy);
    } catch (err) {
      res.status(400).json({ error: "Failed to create pharmacy" });
    }
  });

  app.put("/api/pharmacies/:id", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const pharmacy = await Pharmacy.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!pharmacy) return res.status(404).json({ error: "Pharmacy not found" });
      res.json(pharmacy);
    } catch (err) {
      res.status(400).json({ error: "Failed to update pharmacy" });
    }
  });

  // ─── DEALERS ────────────────────────────────────────────────────────
  app.get("/api/dealers", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const dealers = await Dealer.find({ isActive: true }).sort({ createdAt: -1 }).lean();
      res.json(dealers);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch dealers" });
    }
  });

  app.get("/api/dealers/:id", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const dealer = await Dealer.findById(req.params.id).lean();
      if (!dealer) return res.status(404).json({ error: "Dealer not found" });
      res.json(dealer);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch dealer" });
    }
  });

  app.post("/api/dealers", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const dealer = new Dealer(req.body);
      await dealer.save();
      res.status(201).json(dealer);
    } catch (err) {
      res.status(400).json({ error: "Failed to create dealer" });
    }
  });

  app.put("/api/dealers/:id", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const dealer = await Dealer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!dealer) return res.status(404).json({ error: "Dealer not found" });
      res.json(dealer);
    } catch (err) {
      res.status(400).json({ error: "Failed to update dealer" });
    }
  });

  // ─── MEDICINES (collection: Medicines) ──────────────────────────────
  app.get("/api/medicines", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const { search, category } = req.query;
      const filter: any = {};
      if (search) filter.name = { $regex: search, $options: "i" };
      if (category) filter.category = category;
      const medicines = await Medicine.find(filter).sort({ name: 1 }).lean();
      res.json(medicines);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch medicines" });
    }
  });

  app.post("/api/medicines", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const medicine = new Medicine(req.body);
      await medicine.save();
      res.status(201).json(medicine);
    } catch (err) {
      res.status(400).json({ error: "Failed to create medicine" });
    }
  });

  app.put("/api/medicines/:id", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!medicine) return res.status(404).json({ error: "Medicine not found" });
      res.json(medicine);
    } catch (err) {
      res.status(400).json({ error: "Failed to update medicine" });
    }
  });

  // ─── INVENTORY (collection: Inventory — dealer warehouse stock) ──────
  app.get("/api/inventory", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const { search, status } = req.query;
      const filter: any = {};
      if (search) filter.medicine_name = { $regex: search, $options: "i" };
      if (status) filter.status = status;
      const inventory = await Inventory.find(filter).sort({ medicine_name: 1 }).lean();
      res.json(inventory);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/low-stock", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const items = await Inventory.find({ status: { $in: ["low_stock", "out_of_stock"] } })
        .sort({ stock_quantity: 1 })
        .lean();
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch low stock items" });
    }
  });

  app.post("/api/inventory", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const item = new Inventory(req.body);
      await item.save();
      res.status(201).json(item);
    } catch (err) {
      res.status(400).json({ error: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory/:id", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!item) return res.status(404).json({ error: "Inventory item not found" });
      res.json(item);
    } catch (err) {
      res.status(400).json({ error: "Failed to update inventory" });
    }
  });

  // ─── CONVERSATIONS (collection: Live_Conversations) ──────────────────
  app.get("/api/conversations", async (req, res) => {
    if (!isMongoConnected()) return res.json({ conversations: [], total: 0, page: 1, totalPages: 0 });
    try {
      const { pharmacy, type, page = 1, limit = 20 } = req.query;
      const filter: any = {};
      if (pharmacy) filter.pharmacy_name = { $regex: pharmacy, $options: "i" };
      if (type && type !== "all") filter.type = type;
      const skip = (Number(page) - 1) * Number(limit);
      const [conversations, total] = await Promise.all([
        Conversation.find(filter)
          .sort({ timestamp: -1 })
          .skip(skip)
          .limit(Number(limit))
          .select("-audio_bytes")
          .lean(),
        Conversation.countDocuments(filter),
      ]);
      res.json({ conversations, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/conversations/:id", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const conversation = await Conversation.findById(req.params.id).select("-audio_bytes").lean();
      if (!conversation) return res.status(404).json({ error: "Conversation not found" });
      res.json(conversation);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch conversation" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const conversation = new Conversation(req.body);
      await conversation.save();
      res.status(201).json(conversation);
    } catch (err) {
      res.status(400).json({ error: "Failed to create conversation" });
    }
  });

  // ─── ORDERS (collection: Orders) ─────────────────────────────────────
  app.get("/api/stock-requests", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const { status, pharmacist_id } = req.query;
      const filter: any = {};
      if (status) filter.status = status;
      if (pharmacist_id) filter.pharmacist_id = pharmacist_id;
      const requests = await StockRequest.find(filter).sort({ order_timestamp: -1 }).lean();
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/stock-requests/:id", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const request = await StockRequest.findById(req.params.id).lean();
      if (!request) return res.status(404).json({ error: "Order not found" });
      res.json(request);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/stock-requests", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const request = new StockRequest(req.body);
      await request.save();
      res.status(201).json(request);
    } catch (err) {
      res.status(400).json({ error: "Failed to create order" });
    }
  });

  app.put("/api/stock-requests/:id/status", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const { status } = req.body;
      const request = await StockRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
      if (!request) return res.status(404).json({ error: "Order not found" });
      res.json(request);
    } catch (err) {
      res.status(400).json({ error: "Failed to update order" });
    }
  });

  // ─── OFFERS (collection: Offers) ─────────────────────────────────────
  app.get("/api/offers", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const { status } = req.query;
      const filter: any = status ? { status } : {};
      const offers = await Offer.find(filter).sort({ valid_from: -1 }).lean();
      res.json(offers);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch offers" });
    }
  });

  app.post("/api/offers", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const offer = new Offer(req.body);
      await offer.save();
      res.status(201).json(offer);
    } catch (err) {
      res.status(400).json({ error: "Failed to create offer" });
    }
  });

  app.put("/api/offers/:id", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
      if (!offer) return res.status(404).json({ error: "Offer not found" });
      res.json(offer);
    } catch (err) {
      res.status(400).json({ error: "Failed to update offer" });
    }
  });

  // ─── PERSONALIZATION ─────────────────────────────────────────────────
  app.get("/api/personalization", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const { pharmacist_id } = req.query;
      const filter = pharmacist_id ? { pharmacist_id } : {};
      const data = await Personalization.find(filter).lean();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch personalization data" });
    }
  });

  app.get("/api/personalization/:pharmacist_id", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const data = await Personalization.findOne({ pharmacist_id: req.params.pharmacist_id }).lean();
      if (!data) return res.status(404).json({ error: "Personalization not found" });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch personalization" });
    }
  });

  // ─── SCHEDULES ────────────────────────────────────────────────────────
  app.get("/api/schedules", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const { pharmacist_id, status } = req.query;
      const filter: any = {};
      if (pharmacist_id) filter.pharmacist_id = pharmacist_id;
      if (status) filter.status = status;
      const schedules = await Schedule.find(filter).sort({ next_execution: 1 }).lean();
      res.json(schedules);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch schedules" });
    }
  });

  app.post("/api/schedules", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const schedule = new Schedule(req.body);
      await schedule.save();
      res.status(201).json(schedule);
    } catch (err) {
      res.status(400).json({ error: "Failed to create schedule" });
    }
  });

  // ─── TWILIO STATUS ────────────────────────────────────────────────────
  app.get("/api/twilio/status", (_req, res) => {
    const configured = !!(
      process.env.TWILIO_ACCOUNT_SID &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_PHONE_NUMBER
    );
    res.json({
      configured,
      phoneNumber: configured ? process.env.TWILIO_PHONE_NUMBER : null,
    });
  });

  // ─── AI CHAT (Inbound call simulation) ──────────────────────────────
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, pharmacyId, conversationHistory = [] } = req.body;

      let pharmacy = null;
      if (pharmacyId) {
        pharmacy = await Pharmacy.findById(pharmacyId).populate("dealerId").lean();
      }

      const p = pharmacy as any;
      const systemPrompt = pharmacy
        ? `You are MediVoice AI, a friendly and professional pharmacy assistant bot. You are talking to ${p.name} pharmacy located in ${p.location || "your area"}. Their discount tier is ${p.discount_tier || "Standard"}. Preferred brands: ${(p.preferred_brands || []).join(", ") || "any"}. You help with stock checks, medicine inquiries, and reorder requests. Be concise and helpful. If they mention low stock or reorder needs, ask for specific medicine names and quantities.`
        : `You are MediVoice AI, a pharmacy assistant bot. Help pharmacists with stock inquiries, medicine availability, and reorder requests. Be concise and friendly.`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...conversationHistory,
        { role: "user" as const, content: message },
      ];

      const response = await getOpenAI().chat.completions.create({
        model: "gpt-4o",
        messages,
        max_tokens: 300,
      });

      const reply = response.choices[0]?.message?.content || "I'm here to help. Could you please repeat that?";
      res.json({ reply, usage: response.usage });
    } catch (err) {
      console.error("AI chat error:", err);
      res.status(500).json({ error: "AI service unavailable" });
    }
  });

  // ─── TWILIO WEBHOOK (Inbound call handler) ───────────────────────────
  app.post("/api/twilio/inbound", async (req, res) => {
    const callerNumber = req.body?.From || "Unknown";

    // Try to find the pharmacy by contact number
    let pharmacyName = "Caller";
    try {
      const pharmacy = await Pharmacy.findOne({ contact: callerNumber }).lean() as any;
      if (pharmacy) pharmacyName = pharmacy.name;
    } catch {}

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to MediVoice AI. Hello ${pharmacyName}! I can help you with stock availability, medicine pricing, and active promotional offers. Please describe your requirements after the beep.</Say>
  <Record maxLength="45" action="/api/twilio/process-recording" transcribe="true" transcribeCallback="/api/twilio/transcription" playBeep="true" />
</Response>`;
    res.type("text/xml").send(twiml);
  });

  app.post("/api/twilio/process-recording", async (req, res) => {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you! I have received your request and our team will process it shortly. You will receive a confirmation. Goodbye!</Say>
  <Hangup />
</Response>`;
    res.type("text/xml").send(twiml);
  });

  // ─── TWILIO TRANSCRIPTION CALLBACK ────────────────────────────────────
  app.post("/api/twilio/transcription", async (req, res) => {
    try {
      const { TranscriptionText, From, CallSid } = req.body;
      if (!TranscriptionText) return res.sendStatus(200);

      // Look up pharmacy by caller number
      let pharmacyName = From || "Unknown Caller";
      let pharmacyId: string | null = null;
      try {
        const pharmacy = await Pharmacy.findOne({ contact: From }).lean() as any;
        if (pharmacy) { pharmacyName = pharmacy.name; pharmacyId = String(pharmacy._id); }
      } catch {}

      // Generate AI response to the transcribed speech
      let aiResponse = "Thank you for your request. We will process it shortly.";
      try {
        const medicines = await Medicine.find({ stock_quantity: { $gt: 0 } }).select("name price_per_unit stock_quantity discount").limit(10).lean() as any[];
        const offers = await Offer.find({ status: "Active" }).select("offer_name discount_percent target_group").limit(5).lean() as any[];
        const medicineList = medicines.map((m: any) => `${m.name} ($${m.price_per_unit}, ${m.stock_quantity} units${m.discount ? `, ${m.discount}% off` : ""})`).join("; ");
        const offerList = offers.map((o: any) => `${o.offer_name}: ${o.discount_percent}% off`).join("; ");

        const completion = await getOpenAI().chat.completions.create({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `You are MediVoice AI. A pharmacist just called and said: "${TranscriptionText}". Reply in 1-2 sentences addressing their request. Available stock: ${medicineList}. Active offers: ${offerList}. Be helpful and specific.`
            },
            { role: "user", content: TranscriptionText }
          ],
          max_tokens: 200,
        });
        aiResponse = completion.choices[0]?.message?.content || aiResponse;
      } catch (err) {
        console.error("AI transcription response error:", err);
      }

      // Save the conversation to MongoDB
      if (isMongoConnected()) {
        const conversation = new Conversation({
          pharmacy_name: pharmacyName,
          pharmacist_text: TranscriptionText,
          ai_response: aiResponse,
          timestamp: new Date(),
          type: "inbound",
          call_sid: CallSid,
          status: "transcribed",
        });
        await conversation.save();
      }

      res.sendStatus(200);
    } catch (err) {
      console.error("Transcription callback error:", err);
      res.sendStatus(200);
    }
  });

  // ─── OUTBOUND CALL TRIGGER ───────────────────────────────────────────
  app.post("/api/twilio/outbound", async (req, res) => {
    try {
      const { pharmacyId, reason, to: directNumber, pharmacyName: directName } = req.body;
      const twilio_sid = process.env.TWILIO_ACCOUNT_SID;
      const twilio_token = process.env.TWILIO_AUTH_TOKEN;
      const twilio_number = process.env.TWILIO_PHONE_NUMBER;

      if (!twilio_sid || !twilio_token || !twilio_number) {
        return res.status(503).json({ error: "Twilio not configured." });
      }

      let toNumber = directNumber;
      let resolvedName = directName || "Pharmacist";

      if (!toNumber && pharmacyId) {
        const pharmacy = await Pharmacy.findById(pharmacyId);
        if (!pharmacy) return res.status(404).json({ error: "Pharmacy not found" });
        toNumber = (pharmacy as any).contact;
        resolvedName = (pharmacy as any).name;
      }

      if (!toNumber) return res.status(400).json({ error: "No phone number provided." });

      const { default: twilioLib } = await import("twilio");
      const twilio = twilioLib(twilio_sid, twilio_token);

      const baseUrl = process.env.BASE_URL || `${req.protocol}://${req.get("host")}`;
      const call = await twilio.calls.create({
        to: toNumber,
        from: twilio_number,
        url: `${baseUrl}/api/twilio/outbound-script?reason=${encodeURIComponent(reason || "stock check and medicine enquiry")}&pharmacyName=${encodeURIComponent(resolvedName)}`,
      });

      const conversation = new Conversation({
        pharmacy_name: resolvedName,
        timestamp: new Date(),
        type: "outbound",
        status: "initiated",
      });
      await conversation.save();

      res.json({ success: true, callSid: call.sid, conversationId: conversation._id });
    } catch (err: any) {
      console.error("Outbound call error:", err);
      res.status(500).json({ error: err.message || "Failed to initiate call" });
    }
  });

  app.get("/api/twilio/outbound-script", async (req, res) => {
    const { pharmacyName, reason } = req.query as Record<string, string>;
    const name = pharmacyName || "valued pharmacy";
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello! This is MediVoice AI, your automated pharmacy assistant. I am calling ${name} regarding a ${reason || "stock check and medicine enquiry"}. Please speak your questions about stock availability, pricing, or current offers after the beep, and I will assist you right away.</Say>
  <Record maxLength="60" action="/api/twilio/process-recording" transcribe="true" transcribeCallback="/api/twilio/transcription" playBeep="true" />
</Response>`;
    res.type("text/xml").send(twiml);
  });

  return httpServer;
}
