import { mongoose } from "../db/mongoose";

const triggerWordSchema = new mongoose.Schema({
  pharmacyId:   { type: String },
  pharmacyName: { type: String, required: true },
  triggerWord:  { type: String, required: true },
  confidence:   { type: Number },
  context:      { type: String },
  callInitiated:{ type: Boolean, default: false },
  timestamp:    { type: Date, default: Date.now },
}, { collection: "TriggerDetections", strict: false });

export const TriggerWord = mongoose.models.TriggerWord ||
  mongoose.model("TriggerWord", triggerWordSchema, "TriggerDetections");
