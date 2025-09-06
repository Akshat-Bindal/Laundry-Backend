import { generateInvoice } from "../utils/invoiceGenerator.js";
import Order from "../models/Order.js";

export const handleOrderStatusChange = async (order, next) => {
  try {
    // Run only when status is "ready" and invoice not already created
    if (order.status === "ready" && !order.invoice?.invoiceId) {
      console.log(`📄 Generating invoice for order: ${order._id}`);

      const updatedOrder = await generateInvoice(order);

      // Save invoice details back to DB
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

