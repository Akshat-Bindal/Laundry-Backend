import Invoice from "../models/Invoice.js";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js";
import User from "../models/User.js";

export async function handleInvoiceOnStatusChange(order) {
  if (order.status !== "ready") return; // only generate when ready

  const user = await User.findById(order.user);

  // Calculate urgency charge
  let urgencyCharge = 0;
  if (order.urgency === "next-day") urgencyCharge = 100;
  if (order.urgency === "same-day") urgencyCharge = 200;

  const subtotal = order.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const total = subtotal + urgencyCharge;

  order.subtotal = subtotal;
  order.urgencyCharge = urgencyCharge;
  order.total = total;

  const invoiceUrl = await generateInvoicePDF(order, user);

  const invoice = await Invoice.create({
    invoiceNo: order._id.toString().slice(-6),
    order: order._id,
    customerName: user.name,
    customerPhone: user.phone,
    customerAddress: user.addresses?.[0] || "-",
    items: order.items.map((i) => ({
      serviceName: i.serviceName,
      quantity: i.quantity,
      price: i.price,
      total: i.quantity * i.price,
    })),
    subtotal,
    urgencyCharge,
    total,
    invoiceUrl,
  });

  order.invoice = invoice._id;
  await order.save();
}
