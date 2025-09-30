import express from 'express';
import { getAllInvoices,getInvoice, getMyInvoices, getInvoicePdf } from '../controllers/invoiceControllers.js';
import { protect } from '../middleware/authMiddleware.js';

const r = express.Router();

r.get('/', protect, getAllInvoices);
r.get('/my-invoices', protect, getMyInvoices);
r.get('/:invoiceId', protect, getInvoice);
r.get('/:invoiceId/pdf', getInvoicePdf)

export default r;