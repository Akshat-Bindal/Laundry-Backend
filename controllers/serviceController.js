import Service from '../models/Service.js';
import ServiceCategory from '../models/ServiceCategory.js';

export const listCategories = async (_req, res) => {
  const cats = await ServiceCategory.find({}).sort('name');
  res.json(cats);
};

export const listServices = async (req, res) => {
  const { categoryCode, q, limit = 100, page = 1 } = req.query;
  const query = { isActive: true };
  if (categoryCode) {
    const cat = await ServiceCategory.findOne({ code: categoryCode });
    if (cat) query.category = cat._id;
  }
  if (q) query.$text = { $search: q };
  const docs = await Service.find(query)
    .populate('category', 'name code pricingUnit')
    .skip((page - 1) * limit)
    .limit(Number(limit))
    .sort('name');
  res.json(docs);
};
