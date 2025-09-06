import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    customerName: String,
    customerPhone: String,
    customerAddress: String,
    items: [
      {
        serviceName: String,
        quantity: Number,
        price: Number,
        total: Number,
      },
    ],
    subtotal: Number,
    urgencyCharge: Number,
    total: Number,
    invoiceUrl: String, // Cloudinary link
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
