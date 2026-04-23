const Menu = require('../models/Menu');
const MealOrder = require('../models/MealOrder');
const MessRate = require('../models/MessRate');

exports.getWeeklyMenu = async (req, res) => {
  try {
    const menus = await Menu.find({ isActive: true });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTodayMenu = async (req, res) => {
  try {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[new Date().getDay()];
    const menu = await Menu.findOne({ dayOfWeek: today, isActive: true });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const { dayOfWeek, breakfast, lunch, dinner, isVeg } = req.body;
    let menu = await Menu.findOne({ dayOfWeek });
    if (menu) {
      menu.breakfast = breakfast;
      menu.lunch = lunch;
      menu.dinner = dinner;
      menu.isVeg = isVeg !== undefined ? isVeg : true;
      await menu.save();
    } else {
      menu = await Menu.create({ dayOfWeek, breakfast, lunch, dinner, isVeg });
    }
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const { breakfast, lunch, dinner, isVeg } = req.body;
    const menu = await Menu.findByIdAndUpdate(req.params.id, { breakfast, lunch, dinner, isVeg }, { new: true });
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    res.json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    res.json({ message: 'Menu removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.optInMeal = async (req, res) => {
  try {
    if (req.user.role === 'tenant' && req.body.tenantId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { tenantId, date, mealType, cost } = req.body;
    const order = await MealOrder.findOneAndUpdate(
      { tenantId, date: new Date(date), mealType },
      { optIn: true, cost },
      { upsert: true, new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.optOutMeal = async (req, res) => {
  try {
    if (req.user.role === 'tenant' && req.body.tenantId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { tenantId, date, mealType } = req.body;
    const order = await MealOrder.findOneAndUpdate(
      { tenantId, date: new Date(date), mealType },
      { optIn: false, cost: 0 },
      { upsert: true, new: true }
    );
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOrdersByTenant = async (req, res) => {
  try {
    if (req.user.role === 'tenant' && req.params.id !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const orders = await MealOrder.find({ tenantId: req.params.id }).sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTodayOrders = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() + 1);

    const orders = await MealOrder.find({ date: { $gte: today, $lt: end }, optIn: true });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTodayOrderStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(end.getDate() + 1);

    const orders = await MealOrder.find({ date: { $gte: today, $lt: end }, optIn: true });
    
    let breakfast = 0, lunch = 0, dinner = 0;
    orders.forEach(o => {
      if (o.mealType === 'breakfast') breakfast++;
      if (o.mealType === 'lunch') lunch++;
      if (o.mealType === 'dinner') dinner++;
    });

    res.json({ breakfast, lunch, dinner });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.calculateBill = async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    if (req.user.role === 'tenant' && tenantId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const { month, year } = req.query;
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const orders = await MealOrder.find({
      tenantId,
      date: { $gte: startDate, $lte: endDate },
      optIn: true
    });

    const totalBill = orders.reduce((acc, order) => acc + order.cost, 0);
    res.json({ tenantId, month, year, totalBill, mealsCount: orders.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMessRate = async (req, res) => {
  try {
    let rate = await MessRate.findOne({});
    if (!rate) {
      rate = await MessRate.create({ ratePerMeal: 50 });
    }
    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateMessRate = async (req, res) => {
  try {
    const { ratePerMeal } = req.body;
    let rate = await MessRate.findOne({});
    if (rate) {
      rate.ratePerMeal = ratePerMeal;
      await rate.save();
    } else {
      rate = await MessRate.create({ ratePerMeal });
    }
    res.json(rate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
