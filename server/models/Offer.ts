import { mongoose } from "../db/mongoose";

const offerSchema = new mongoose.Schema({
  dealerId: { type: mongoose.Schema.Types.ObjectId, ref: "Dealer", required: true },
  title: { type: String, required: true },
  description: { type: String },
  medicineName: { type: String },
  discountPercent: { type: Number },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date },
  isActive: { type: Boolean, default: true },
  targetPharmacies: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy" }],
}, { timestamps: true });

export const Offer = mongoose.models.Offer || mongoose.model("Offer", offerSchema);
