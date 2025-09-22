import Order from "../models/Order.js";
import Invoice from "../models/Invoice.js";
import User from "../models/User.js";

export const getSummaryAnalytics = async (req, res) => {
  try {
    // 1️⃣ Total Sales (sum of all invoices total)
    const totalSalesResult = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    const totalSales = totalSalesResult[0]?.total || 0;

    // 2️⃣ Total Orders
    const totalOrders = await Order.countDocuments();

    // 3️⃣ Total Active Customers (unique users who placed an order)
    const activeCustomersResult = await Order.distinct("user");
    const totalActiveCustomers = activeCustomersResult.length;

    // 4️⃣ Pending Orders (status = requested OR picked_up OR processing)
    const pendingOrders = await Order.countDocuments({
      status: { $in: ["requested", "picked_up", "processing"] },
    });

    res.status(200).json({
      success: true,
      analytics: {
        totalSales,
        totalOrders,
        totalActiveCustomers,
        pendingOrders,
      },
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching analytics",
    });
  }
};
