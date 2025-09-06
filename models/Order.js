import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        serviceName: String,
        quantity: Number,
        price: Number,
      },
    ],
    urgency: {
      type: String,
      enum: ["normal", "next-day", "same-day"],
      default: "normal",
    },
    subtotal: Number,
    urgencyCharge: { type: Number, default: 0 },
    total: Number,
    status: {
      type: String,
      enum: ["processing", "ready", "delivered"],
      default: "processing",
    },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
