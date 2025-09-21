import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { checkout, myOrders, getAllOrders, updateOrderStatus,updatePickup, getInvoice } from '../controllers/orderController.js';
const r = express.Router();

r.get('/', protect, getAllOrders);
r.get('/my', protect, myOrders);
r.post('/checkout', protect, checkout);
r.patch('/:id/status', protect, authorize('admin'), updateOrderStatus);
r.patch("/:orderId/weight",protect,updatePickup);
r.get("/:orderId/invoice", protect, getInvoice);

export default r;
