import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { checkout, myOrders, getOrderById, getAllOrders, updateOrderStatus,updatePickup,} from '../controllers/orderController.js';

const r = express.Router();

r.get('/my', protect, myOrders);
r.get('/', protect, getAllOrders);
r.get("/:id", getOrderById);
r.post('/checkout', protect, checkout);
r.patch('/:id/status', protect, authorize('admin'), updateOrderStatus);
r.patch("/:orderId/weight",protect,updatePickup);


export default r;
