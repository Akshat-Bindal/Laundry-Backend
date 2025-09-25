import Invoice from "../models/Invoice.js";
import Order from "../models/Order.js";

export const getInvoice = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId).populate("invoice");
    if (!order) return res.status(404).json({ message: "Order not found" });

    if (!order.invoice) {
      return res.status(400).json({ message: "Invoice not generated yet" });
    }

    const invoice = await Invoice.findById(order.invoice);
    res.json({ invoiceUrl: invoice.invoiceUrl, invoice });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find()
      .populate("order", "status total createdAt") 
      .sort({ createdAt: -1 }); 

    res.status(200).json({
      success: true,
      count: invoices.length,
      data: invoices,
    });
  } catch (err) {
    console.error("Error fetching invoices:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMyInvoices = async (req, res) => {
  try {
    const userId = req.user.id;

    const invoices = await Invoice.find()
      .populate({
        path: "order",
        match: { user: userId }, 
        populate: { path: "user", select: "name email" }, 
      })
      .lean();


    const userInvoices = invoices.filter((inv) => inv.order !== null);

    res.json({
      success: true,
      count: userInvoices.length,
      data: userInvoices,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};