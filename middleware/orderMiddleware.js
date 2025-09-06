import { generateInvoice } from "../utils/invoiceGenerator.js";
import Order from "../models/Order.js";

export const handleOrderStatusChange = async (order, next) => {
  try {
    if (order.status === "ready" && !order.invoice?.invoiceId) {
      console.log(`📄 Generating invoice for order: ${order._id}`);

      const updatedOrder = await generateInvoice(order);

      await Order.findByIdAndUpdate(order._id, {
        invoice: updatedOrder.invoice,
      });

      console.log("✅ Invoice generated & saved for order:", order._id);
    }
  } catch (err) {
    console.error("❌ Error in order middleware:", err);
  }

  next();
};

