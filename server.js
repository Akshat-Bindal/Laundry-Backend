import dotenv from 'dotenv';
dotenv.config(); 
import express from 'express';
import cors from "cors"
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import getSummaryAnalytics from './routes/analyticsRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import invoiceRoutes from './routes/invoiceRoutes.js';

connectDB();

const app = express();
app.use(express.json());

const allowedOrigins = [
  "https://washingtonslaundry.store",
  "http://localhost:3000",
  "https://washingtons.in" 
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  credentials: true
}));

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', getSummaryAnalytics);
app.use('/api/services', serviceRoutes);
app.use("/api/users", userRoutes);
app.use('/api/invoices', invoiceRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
