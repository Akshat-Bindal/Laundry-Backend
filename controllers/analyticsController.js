import Order from "../models/Order.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";

export const getSummaryAnalytics = async (req, res) => {
  try {
    // Total Orders
    const totalOrders = await Invoice.countDocuments();

    // Delivered Orders
    const deliveredOrders = await Invoice.countDocuments({ status: "Delivered" });

    // Pending Orders
    const pendingOrders = await Invoice.countDocuments({ status: "Pending" });

    // Total Revenue
    const revenueAgg = await Invoice.aggregate([
      { $group: { _id: null, revenue: { $sum: "$total" } } }
    ]);
    const totalRevenue = revenueAgg[0]?.revenue || 0;

    // Total Customers (unique phone)
    const customersAgg = await Invoice.distinct("customerPhone");
    const totalCustomers = customersAgg.length;

    // Orders by Laundry Type
    const typeAgg = await Invoice.aggregate([
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.laundryType",
          count: { $sum: "$items.qty" }
        }
      }
    ]);

    // ====== Date-based analytics ======

    // Today’s start and end
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todaysOrders = await Invoice.countDocuments({
      createdAt: { $gte: startOfToday, $lte: endOfToday }
    });

    // This Month’s start and end
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const monthlyOrders = await Invoice.countDocuments({
      createdAt: { $gte: startOfMonth, $lte: endOfMonth }
    });

    // ====== Final result ======
    const result = {
      totalOrders,
      deliveredOrders,
      pendingOrders,
      totalRevenue,
      totalCustomers,
      todaysOrders,
      monthlyOrders,
      laundryTypes: {
        wash: typeAgg.find(t => t._id === "wash")?.count || 0,
        iron: typeAgg.find(t => t._id === "iron")?.count || 0,
        dry: typeAgg.find(t => t._id === "dry")?.count || 0,
        "wash & iron": typeAgg.find(t => t._id === "Wash & Iron")?.count || 0
      }
    };

    res.json(result);
  } catch (err) {
    console.error("Analytics API Error:", err);
    res.status(500).json({ error: "Server error" });
  }
};