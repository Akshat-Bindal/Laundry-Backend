import express from 'express';
import { listCategories, listServices } from '../controllers/serviceController.js';
import { protect } from '../middleware/authMiddleware.js';
const r = express.Router();

r.get('/categories', protect,listCategories);
r.get('/',protect, listServices);

export default r;
