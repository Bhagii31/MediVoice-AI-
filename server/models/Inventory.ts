import { mongoose } from "../db/mongoose";

const inventorySchema = new mongoose.Schema({
  pharmacyId: { type: mongoose.Schema.Types.ObjectId, ref: "Pharmacy", required: true },
  medicineId: { type: mongoose.Schema.Types.ObjectId, ref: "Medicine", required: true },
  medicineName: { type: String, required: true },
  currentStock: { type: Number, default: 0 },
  minimumStock: { type: Number, default: 10 },
  unit: { type: String, default: "strips" },
  lastUpdated: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ["normal", "low", "critical", "out_of_stock"],
    default: "normal",
  },
}, { timestamps: true });

export const Inventory = mongoose.models.Inventory || mongoose.model("Inventory", inventorySchema);
