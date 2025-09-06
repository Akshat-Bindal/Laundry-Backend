import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import cartRoutes from "./routes/cartRoutes.js"

connectDB();

const app = express();
app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/services', serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/cart", cartRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
