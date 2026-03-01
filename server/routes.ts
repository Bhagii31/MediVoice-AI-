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
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

  // ─── DASHBOARD STATS ───────────────────────────────────────────────
  app.get("/api/stats", async (req, res) => {
    if (!isMongoConnected()) {
      return res.json({ pharmacies: 0, dealers: 0, conversations: 0, pendingOrders: 0, lowStock: 0, recentCalls: [] });
    }
    try {
      const [pharmacies, dealers, conversations, stockRequests] = await Promise.all([
        Pharmacy.countDocuments({ isActive: true }),
        Dealer.countDocuments({ isActive: true }),
        Conversation.countDocuments(),
        StockRequest.countDocuments({ status: "pending" }),
      ]);
      const lowStock = await Inventory.countDocuments({ status: { $in: ["low", "critical", "out_of_stock"] } });
      const recentCalls = await Conversation.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .lean();
      res.json({ pharmacies, dealers, conversations, pendingOrders: stockRequests, lowStock, recentCalls });
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  // ─── PHARMACIES ─────────────────────────────────────────────────────
  app.get("/api/pharmacies", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const pharmacies = await Pharmacy.find().populate("dealerId").sort({ createdAt: -1 }).lean();
      res.json(pharmacies);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch pharmacies" });
    }
  });

  app.get("/api/pharmacies/:id", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const pharmacy = await Pharmacy.findById(req.params.id).populate("dealerId").lean();
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

  // ─── MEDICINES ──────────────────────────────────────────────────────
  app.get("/api/medicines", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const medicines = await Medicine.find({ isActive: true }).sort({ name: 1 }).lean();
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

  // ─── INVENTORY ──────────────────────────────────────────────────────
  app.get("/api/inventory", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const { pharmacyId } = req.query;
      const filter = pharmacyId ? { pharmacyId } : {};
      const inventory = await Inventory.find(filter)
        .populate("pharmacyId", "name phone city")
        .populate("medicineId", "name manufacturer")
        .sort({ status: 1, medicineName: 1 })
        .lean();
      res.json(inventory);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/low-stock", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const items = await Inventory.find({
        status: { $in: ["low", "critical", "out_of_stock"] },
      })
        .populate("pharmacyId", "name phone city")
        .populate("medicineId", "name manufacturer")
        .sort({ status: -1 })
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
      const item = await Inventory.findByIdAndUpdate(req.params.id, { ...req.body, lastUpdated: new Date() }, { new: true });
      if (!item) return res.status(404).json({ error: "Inventory item not found" });
      res.json(item);
    } catch (err) {
      res.status(400).json({ error: "Failed to update inventory" });
    }
  });

  // ─── CONVERSATIONS / CALL LOGS ──────────────────────────────────────
  app.get("/api/conversations", async (req, res) => {
    if (!isMongoConnected()) return res.json({ conversations: [], total: 0, page: 1, totalPages: 0 });
    try {
      const { type, pharmacyId, page = 1, limit = 20 } = req.query;
      const filter: any = {};
      if (type) filter.type = type;
      if (pharmacyId) filter.pharmacyId = pharmacyId;
      const skip = (Number(page) - 1) * Number(limit);
      const [conversations, total] = await Promise.all([
        Conversation.find(filter)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .populate("pharmacyId", "name phone city")
          .populate("dealerId", "name companyName")
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
      const conversation = await Conversation.findById(req.params.id)
        .populate("pharmacyId")
        .populate("dealerId")
        .lean();
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

  // ─── STOCK REQUESTS / ORDERS ─────────────────────────────────────────
  app.get("/api/stock-requests", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const { status, dealerId, pharmacyId } = req.query;
      const filter: any = {};
      if (status) filter.status = status;
      if (dealerId) filter.dealerId = dealerId;
      if (pharmacyId) filter.pharmacyId = pharmacyId;
      const requests = await StockRequest.find(filter)
        .populate("pharmacyId", "name phone city address")
        .populate("dealerId", "name companyName phone")
        .populate("conversationId", "type status createdAt")
        .sort({ createdAt: -1 })
        .lean();
      res.json(requests);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch stock requests" });
    }
  });

  app.get("/api/stock-requests/:id", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const request = await StockRequest.findById(req.params.id)
        .populate("pharmacyId")
        .populate("dealerId")
        .populate("conversationId")
        .lean();
      if (!request) return res.status(404).json({ error: "Stock request not found" });
      res.json(request);
    } catch (err) {
      res.status(500).json({ error: "Failed to fetch stock request" });
    }
  });

  app.post("/api/stock-requests", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const request = new StockRequest(req.body);
      await request.save();
      res.status(201).json(request);
    } catch (err) {
      res.status(400).json({ error: "Failed to create stock request" });
    }
  });

  app.put("/api/stock-requests/:id/status", async (req, res) => {
    if (!requireMongo(res)) return;
    try {
      const { status } = req.body;
      const update: any = { status };
      if (status === "dispatched") update.dispatchedAt = new Date();
      if (status === "delivered") update.deliveredAt = new Date();
      const request = await StockRequest.findByIdAndUpdate(req.params.id, update, { new: true });
      if (!request) return res.status(404).json({ error: "Stock request not found" });
      res.json(request);
    } catch (err) {
      res.status(400).json({ error: "Failed to update stock request" });
    }
  });

  // ─── OFFERS ──────────────────────────────────────────────────────────
  app.get("/api/offers", async (req, res) => {
    if (!isMongoConnected()) return res.json([]);
    try {
      const offers = await Offer.find({ isActive: true })
        .populate("dealerId", "name companyName")
        .sort({ createdAt: -1 })
        .lean();
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

  // ─── AI CHAT (Inbound call simulation) ──────────────────────────────
  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message, pharmacyId, conversationHistory = [] } = req.body;

      let pharmacy = null;
      if (pharmacyId) {
        pharmacy = await Pharmacy.findById(pharmacyId).populate("dealerId").lean();
      }

      const systemPrompt = pharmacy
        ? `You are MediVoice AI, a friendly and professional pharmacy assistant bot. You are talking to ${pharmacy.name} pharmacy. Owner: ${pharmacy.ownerName || "the pharmacist"}. You help with stock checks, medicine inquiries, and reorder requests. Be concise and helpful. If they mention low stock or reorder needs, ask for specific medicine names and quantities.`
        : `You are MediVoice AI, a pharmacy assistant bot. Help pharmacists with stock inquiries, medicine availability, and reorder requests. Be concise and friendly.`;

      const messages = [
        { role: "system" as const, content: systemPrompt },
        ...conversationHistory,
        { role: "user" as const, content: message },
      ];

      const response = await openai.chat.completions.create({
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
    const twilioSid = process.env.TWILIO_ACCOUNT_SID;
    if (!twilioSid) {
      return res.status(503).send("Twilio not configured");
    }
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to MediVoice AI. How can I assist you today? Please describe your stock requirements.</Say>
  <Record maxLength="30" action="/api/twilio/process-recording" transcribe="true" transcribeCallback="/api/twilio/transcription" />
</Response>`;
    res.type("text/xml").send(twiml);
  });

  app.post("/api/twilio/process-recording", async (req, res) => {
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Thank you. I have recorded your request and will process it shortly. Goodbye!</Say>
  <Hangup />
</Response>`;
    res.type("text/xml").send(twiml);
  });

  // ─── OUTBOUND CALL TRIGGER ───────────────────────────────────────────
  app.post("/api/twilio/outbound", async (req, res) => {
    try {
      const { pharmacyId, reason } = req.body;
      const twilio_sid = process.env.TWILIO_ACCOUNT_SID;
      const twilio_token = process.env.TWILIO_AUTH_TOKEN;
      const twilio_number = process.env.TWILIO_PHONE_NUMBER;

      if (!twilio_sid || !twilio_token || !twilio_number) {
        return res.status(503).json({ error: "Twilio not configured. Please add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER to secrets." });
      }

      const pharmacy = await Pharmacy.findById(pharmacyId);
      if (!pharmacy) return res.status(404).json({ error: "Pharmacy not found" });

      const { default: twilioLib } = await import("twilio");
      const twilio = twilioLib(twilio_sid, twilio_token);
      const call = await twilio.calls.create({
        to: pharmacy.phone,
        from: twilio_number,
        url: `${req.protocol}://${req.get("host")}/api/twilio/outbound-script?pharmacyId=${pharmacyId}&reason=${encodeURIComponent(reason || "stock check")}`,
      });

      const conversation = new Conversation({
        type: "outbound",
        pharmacyId: pharmacy._id,
        pharmacyName: pharmacy.name,
        pharmacyPhone: pharmacy.phone,
        dealerId: pharmacy.dealerId,
        callSid: call.sid,
        status: "initiated",
        trigger: reason || "stock check",
      });
      await conversation.save();

      res.json({ success: true, callSid: call.sid, conversationId: conversation._id });
    } catch (err: any) {
      console.error("Outbound call error:", err);
      res.status(500).json({ error: err.message || "Failed to initiate call" });
    }
  });

  app.get("/api/twilio/outbound-script", async (req, res) => {
    const { pharmacyId, reason } = req.query;
    let pharmacy: any = null;
    if (pharmacyId) {
      pharmacy = await Pharmacy.findById(pharmacyId).lean();
    }
    const pharmacyName = pharmacy?.name || "the pharmacy";
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Hello, this is MediVoice AI calling on behalf of your medicine dealer. I'm reaching out to ${pharmacyName} regarding a ${reason || "stock check"}. Do you need to reorder any medicines? Please let me know your requirements.</Say>
  <Record maxLength="60" action="/api/twilio/process-recording" transcribe="true" />
</Response>`;
    res.type("text/xml").send(twiml);
  });

  return httpServer;
}
