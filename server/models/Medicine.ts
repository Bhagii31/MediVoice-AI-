import { mongoose } from "../db/mongoose";

const medicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  genericName: { type: String },
  manufacturer: { type: String },
  category: { type: String },
  unit: { type: String, default: "strips" },
  pricePerUnit: { type: Number },
  dealerId: { type: mongoose.Schema.Types.ObjectId, ref: "Dealer" },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

export const Medicine = mongoose.models.Medicine || mongoose.model("Medicine", medicineSchema);
