import { mongoose } from "../db/mongoose";

const messageSchema = new mongoose.Schema({
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["inbound", "outbound"],
    required: true,
  },
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy" },
  pharmacyName: { type: String },
  pharmacyPhone: { type: String },
  dealerId: { type: mongoose.Schema.Types.ObjectId, ref: "Dealer" },
  callSid: { type: String },
  status: {
    type: String,
    enum: ["initiated", "in_progress", "completed", "failed"],
    default: "initiated",
  },
  duration: { type: Number },
  trigger: { type: String },
  summary: { type: String },
  messages: [messageSchema],
  stockRequests: [{
    medicineName: { type: String },
    quantity: { type: Number },
    status: { type: String, enum: ["pending", "confirmed", "declined"], default: "pending" },
  }],
  sentToDealer: { type: Boolean, default: false },
  sentToDealerAt: { type: Date },
}, { timestamps: true });

export const Conversation = mongoose.models.Conversation || mongoose.model("Conversation", conversationSchema);
