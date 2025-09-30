import Order from "../models/Order.js";
import Service from "../models/Service.js";
import Invoice from "../models/Invoice.js";
import { generateInvoicePDF } from "../utils/invoiceGenerator.js"; 


const calculateSubtotal = (items) => {
  return items.reduce((sum, i) => sum + i.total, 0);
};

export const checkout = async (req, res) => {
  try {
    const { services, urgency,shippingAddresses, pickup_time } = req.body;

    if (!services || services.length === 0) {
      return res.status(400).json({ message: "No services selected" });
    }

    const dbServices = await Service.find({
    _id: { $in: services.map((s) => s.service) },
    }).populate("category");

    if (dbServices.length !== services.length) {
      return res
        .status(400)
        .json({ message: "One or more services are invalid" });
    }

    const items = services.map((s) => {
      const dbService = dbServices.find((d) => d._id.equals(s.service));
      let total = 0;


      if (dbService.category && dbService.category.type === "weight") {

        total = 0;
      } else {
        total = dbService.price * s.quantity;
      }

      return {
        service: dbService._id,
        serviceName: dbService.name,
        quantity: s.quantity || null,
        weightKg: s.weightKg || null,
        price: dbService.price,
        total,
      };
    });

    const subtotal = calculateSubtotal(items);

    let urgencyCharge = 0;
    if (urgency === "next-day") urgencyCharge = 100; 
    if (urgency === "same-day") urgencyCharge = 200; 

    const total = subtotal + urgencyCharge;

    const order = await Order.create({
      user: req.user._id,
      items,
      urgency: urgency || "normal",
      subtotal,
      pickup_time,
      urgencyCharge,
      shippingAddresses,
      total,
      status: "requested",
    });

    res.status(201).json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("Checkout error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort("-createdAt")
      .populate("items.service");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email") 
      .populate("items.service", "name price") 
      .populate("invoice", "invoiceNumber total");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching orders",
    });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email addresses phone")
      .populate({
        path: "items.service",
        select: "name price category",
        populate: { path: "category", select: "type name" } // ✅ fetch laundry type
      })
      .populate("invoice", "invoiceNumber total");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      data: order,
    });
  } catch (error) {
    console.error("Error fetching order by ID:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching order",
    });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    let order = await Order.findById(id)
      .populate("user")
      .populate("items.service");

    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    await order.save();

    if (status === "ready" && !order.invoice) {
  const populatedUser = {
    name: order.user.name,
    phone: order.user.phone,
    addresses: order.shippingAddress,
  };

  // still generate once (optional if you only want to check it works)
  await generateInvoicePDF(order, populatedUser);

  const invoice = await Invoice.create({
    invoiceNo: "INV-" + order._id.toString().slice(-8),
    order: order._id,
    customerName: order.user.name,
    customerPhone: order.user.phone,
    customerAddress: order.shippingAddress || order.user.addresses?.[0] || "-",
    items: order.items.map(item => ({
      serviceName: item.serviceName,
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    })),
    subtotal: order.subtotal,
    urgencyCharge: order.urgencyCharge,
    total: order.total,
  });

  order.invoice = invoice._id;
  await order.save();
}



    order = await Order.findById(id)
      .populate("user")
      .populate("items.service")
      .populate("invoice");

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update status error:", err);
    res.status(500).json({ message: err.message });
  }
};

export const updatePickup = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { pickupDetails } = req.body;

    const order = await Order.findById(orderId)
  .populate({
    path: "items.service",
    populate: { path: "category" } // so category data comes in
  });
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.items.forEach((item) => {
      const detail = pickupDetails.find(
        (d) => d.serviceId === item.service._id.toString()
      );
      if (detail && item.service.category.type === "weight") {
        item.weightKg = detail.weightKg;
        item.total = detail.weightKg * item.service.price;
      } else {
        // fallback for piece-based
        item.total = item.quantity * item.service.price;
      }
    });

    // Safe subtotal calculation
    order.subtotal = order.items.reduce(
      (sum, i) => sum + (isNaN(i.total) ? 0 : i.total),
      0
    );
    order.total = order.subtotal + (order.urgencyCharge || 0);

    await order.save();

    res.json({ message: "Pickup updated successfully", order });
  } catch (err) {
    console.error("Pickup update error:", err);
    res.status(500).json({ message: err.message });
  }
};


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
      .populate("order", "status total createdAt") // optional: include order info
      .sort({ createdAt: -1 }); // newest first

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
