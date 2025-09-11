import Service from '../models/Service.js';
import ServiceCategory from '../models/ServiceCategory.js';

export const listCategories = async (_req, res) => {
  const cats = await ServiceCategory.find({}).sort('name');
  res.json(cats);
};

export const listServices = async (req, res) => {
  try {
    const services = await Service.find({ isActive: true })
      .populate("category", "name code pricingUnit") 
      .sort("name"); 

    res.json(services);
  } catch (err) {
    console.error("Error fetching services:", err);
    res.status(500).json({ message: "Failed to fetch services" });
  }
};
