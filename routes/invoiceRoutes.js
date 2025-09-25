import express from 'express';
import { getAllInvoices,getInvoice, getMyInvoices} from '../controllers/invoiceControllers.js';
import { protect } from '../middleware/authMiddleware.js';

const r = express.Router();

r.get('/', protect, getAllInvoices);
r.get('/my-invoices', protect, getMyInvoices);
r.get('/:invoiceId', protect, getInvoice);

export default r;