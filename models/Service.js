import mongoose from "mongoose";

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: "ServiceCategory" },
  imageUrl: { type: String }, // stored in Cloudinary
}, { timestamps: true });

export default mongoose.model("Service", serviceSchema);
