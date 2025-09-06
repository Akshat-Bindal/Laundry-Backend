import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { checkout, myOrders, updatePickupDetails, updateOrderStatus, getInvoice } from '../controllers/orderController.js';
const r = express.Router();

r.get('/my', protect, myOrders);
r.post('/checkout', protect, checkout);
r.patch('/:id/pickup', protect, authorize('admin'), updatePickupDetails);
r.patch('/:id/status', protect, authorize('admin'), updateOrderStatus);
r.get("/:orderId/invoice", protect, getInvoice);

export default r;
