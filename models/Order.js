import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        service: { type: mongoose.Schema.Types.ObjectId, ref: "Service" },
        serviceName: String,
        quantity: { type: Number, default: 1 }, // for per-piece services
        price: { type: Number, required: true }, // rate per kg or per piece
        weightKg: { type: Number, default: 0 },  // for laundry-type services
        total: { type: Number, default: 0 },     // calculated (qty * price OR weight * price)
      },
    ],
    pickup_time: {
      type: String,
      enum: ["Morning", "Afternoon", "Evening"],
    },
    shippingAddress: { type: String },
    urgency: {
      type: String,
      enum: ["normal", "next-day", "same-day"],
      default: "normal",
    },
    subtotal: { type: Number, default: 0 },
    urgencyCharge: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "requested",
        "picked_up",
        "processing",
        "ready",
        "out_for_delivery",
        "delivered",
      ],
      default: "requested",
    },
    invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice" },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
