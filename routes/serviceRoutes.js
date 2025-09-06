import express from 'express';
import { listCategories, listServices } from '../controllers/serviceController.js';
const r = express.Router();

r.get('/categories', listCategories);
r.get('/', listServices);

export default r;
