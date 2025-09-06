import Cart from '../models/Cart.js';
import Service from '../models/Service.js';
import ServiceCategory from '../models/ServiceCategory.js';

const calcLineTotal = ({ pricingUnit, unitPrice, quantity = 1, weightKg = 0 }) => {
  if (pricingUnit === 'per_item' || pricingUnit === 'per_pair') return unitPrice * quantity;
  if (pricingUnit === 'per_kg') return unitPrice * (weightKg || 0);
  return unitPrice * quantity;
};

export const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id }).populate('items.service');
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [], subtotal: 0 });
  res.json(cart);
};

export const addToCart = async (req, res) => {
  const { serviceId, quantity = 1, weightKg } = req.body;
  const service = await Service.findById(serviceId).populate('category');
  if (!service) return res.status(404).json({ message: 'Service not found' });

  const unitPrice = service.basePrice;
  const pricingUnit = service.category.pricingUnit;
  const lineTotal = calcLineTotal({ pricingUnit, unitPrice, quantity, weightKg });

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = await Cart.create({ user: req.user._id, items: [], subtotal: 0 });

  cart.items.push({ service: service._id, quantity, weightKg, unitPrice, lineTotal });
  cart.subtotal = cart.items.reduce((s, i) => s + i.lineTotal, 0);
  await cart.save();
  res.status(201).json(cart);
};

export const removeFromCart = async (req, res) => {
  const { index } = req.params;
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Cart not found' });
  cart.items.splice(Number(index), 1);
  cart.subtotal = cart.items.reduce((s, i) => s + i.lineTotal, 0);
  await cart.save();
  res.json(cart);
};

export const setCheckoutMeta = async (req, res) => {
  const { pickupTime, addressId, notes } = req.body;
  let cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { pickupTime, selectedAddressId: addressId, notes },
    { new: true }
  );
  res.json(cart);
};
