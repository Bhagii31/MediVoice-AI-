import { mongoose } from "../db/mongoose";

const pharmacySchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  licenseNumber: { type: String },
  ownerName: { type: String },
  email: { type: String },
  isActive: { type: Boolean, default: true },
  dealerId: { type: mongoose.Schema.Types.ObjectId, ref: "Dealer" },
  personalization: {
    preferredCallTime: { type: String },
    language: { type: String, default: "en" },
    notes: { type: String },
  },
}, { timestamps: true });

export const Pharmacy = mongoose.models.Pharmacy || mongoose.model("Pharmacy", pharmacySchema);
