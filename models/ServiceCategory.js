import mongoose from "mongoose";

const serviceCategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,
  type: { type: String, enum: ["weight", "piece"], default: "piece" }
}, { timestamps: true });

export default mongoose.model("ServiceCategory", serviceCategorySchema);
