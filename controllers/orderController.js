import Cart from '../models/Cart.js';
import User from '../models/User.js';
import Order from '../models/Order.js';

// Checkout → create order
export const checkout = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id }).populate({
    path: 'items.service',
    populate: { path: 'category', select: 'code' }
  });
  if (!cart || cart.items.length === 0) return res.status(400).json({ message: 'Cart empty' });

  const user = await User.findById(req.user._id);
  const selected = user.addresses.id(cart.selectedAddressId);
  if (!selected) return res.status(400).json({ message: 'Address not found' });

  const items = cart.items.map(i => ({
    service: i.service._id,
    name: i.service.name,
    categoryCode: i.service.category.code,
    quantity: i.quantity,
    weightKg: i.weightKg,
    unitPrice: i.unitPrice,
    lineTotal: i.lineTotal
  }));

  const order = await Order.create({
    customer: req.user._id,
    items,
    subtotal: cart.subtotal,
    pickupTime: cart.pickupTime,
    deliveryAddress: selected.toObject(),
    status: 'order_requested',
    statusHistory: [{ status: 'order_requested', note: 'Order placed by customer' }]
  });

  cart.items = [];
  cart.subtotal = 0;
  await cart.save();

  res.status(201).json(order);
};

// My orders
export const myOrders = async (req, res) => {
  const orders = await Order.find({ customer: req.user._id }).sort('-createdAt');
  res.json(orders);
};

// Pickup weight update
export const updatePickupDetails = async (req, res) => {
  const { id } = req.params;
  const { itemsWeight } = req.body;

  const order = await Order.findById(id).populate('items.service');
  if (!order) return res.status(404).json({ message: 'Order not found' });

  itemsWeight.forEach(({ itemIndex, weightKg }) => {
    const item = order.items[itemIndex];
    if (item && item.categoryCode.includes('WASH')) {
      item.weightKg = weightKg;
      item.lineTotal = weightKg * item.unitPrice;
    }
  });

  order.subtotal = order.items.reduce((s, i) => s + i.lineTotal, 0);
  order.weightTotalKg = order.items.reduce((s, i) => s + (i.weightKg || 0), 0);

  order.status = 'order_pickup';
  order.statusHistory.push({
    status: 'order_pickup',
    note: 'Clothes picked up & weight recorded',
    by: req.user._id
  });

  await order.save();
  res.json(order);
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const order = await Order.findOneAndUpdate(
      { _id: id },
      { status },
      { new: true }
    ).populate("user").populate("items.service");

    if (!order) return res.status(404).json({ message: "Order not found" });

    res.json({ message: "Order status updated", order });
  } catch (err) {
    console.error("Update status error:", err);
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