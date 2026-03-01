import { mongoose } from "../db/mongoose";

const stockRequestSchema = new mongoose.Schema({
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true },
  pharmacyName: { type: String },
  dealerId: { type: mongoose.Schema.Types.ObjectId, ref: "Dealer" },
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation" },
  medicines: [{
    medicineName: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, default: "strips" },
    pricePerUnit: { type: Number },
    totalPrice: { type: Number },
  }],
  status: {
    type: String,
    enum: ["pending", "confirmed", "processing", "dispatched", "delivered", "cancelled"],
    default: "pending",
  },
  notes: { type: String },
  totalAmount: { type: Number },
  dispatchedAt: { type: Date },
  deliveredAt: { type: Date },
}, { timestamps: true });

export const StockRequest = mongoose.models.StockRequest || mongoose.model("StockRequest", stockRequestSchema);
