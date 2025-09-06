import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getCart, addToCart, removeFromCart, setCheckoutMeta } from '../controllers/cartController.js';
const r = express.Router();

r.use(protect);
r.get('/', getCart);
r.post('/add', addToCart);
r.delete('/item/:index', removeFromCart);
r.patch('/checkout-meta', setCheckoutMeta);

export default r;
