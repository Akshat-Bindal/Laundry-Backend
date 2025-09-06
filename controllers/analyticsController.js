import Order from '../models/Order.js';
import dayjs from 'dayjs';
import weekOfYear from 'dayjs/plugin/weekOfYear.js';
dayjs.extend(weekOfYear);

const getAnalytics = async (req, res) => {
  const { type, date, month, year, week } = req.query;
  let start, end;

  if (type === 'daily') {
    start = dayjs(date).startOf('day').toDate();
    end = dayjs(date).endOf('day').toDate();
  } else if (type === 'weekly') {
    start = dayjs().year(year).week(week).startOf('week').toDate();
    end = dayjs().year(year).week(week).endOf('week').toDate();
  } else {
    start = dayjs(`${year}-${month}-01`).startOf('month').toDate();
    end = dayjs(`${year}-${month}-01`).endOf('month').toDate();
  }

  const orders = await Order.find({ createdAt: { $gte: start, $lte: end } });
  const summary = {};
  orders.forEach(o => summary[o.orderType] = (summary[o.orderType] || 0) + 1);
  res.json(summary);
};

export { getAnalytics };