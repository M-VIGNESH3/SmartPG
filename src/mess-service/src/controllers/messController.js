const Menu = require('../models/Menu');
const MealOrder = require('../models/MealOrder');

// @desc Get weekly menu
// @route GET /api/menu/weekly
exports.getWeeklyMenu = async (req, res) => {
  try {
    const menus = await Menu.find({ isActive: true });
    res.json(menus);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Create or update menu
// @route POST /api/menu
exports.createMenu = async (req, res) => {
  try {
    const { dayOfWeek, breakfast, lunch, dinner } = req.body;
    let menu = await Menu.findOne({ dayOfWeek });
    
    if (menu) {
      menu.breakfast = breakfast;
      menu.lunch = lunch;
      menu.dinner = dinner;
      await menu.save();
    } else {
      menu = await Menu.create({ dayOfWeek, breakfast, lunch, dinner });
    }
    
    res.status(201).json(menu);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update menu by id
// @route PUT /api/menu/:id
exports.updateMenu = async (req, res) => {
  try {
    const { breakfast, lunch, dinner } = req.body;
    const menu = await Menu.findById(req.params.id);
    
    if (menu) {
      menu.breakfast = breakfast || menu.breakfast;
      menu.lunch = lunch || menu.lunch;
      menu.dinner = dinner || menu.dinner;
      const updatedMenu = await menu.save();
      res.json(updatedMenu);
    } else {
      res.status(404).json({ message: 'Menu not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Opt-in for a meal
// @route POST /api/orders/opt-in
exports.optInMeal = async (req, res) => {
  try {
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

// @desc Opt-out for a meal
// @route POST /api/orders/opt-out
exports.optOutMeal = async (req, res) => {
  try {
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

// @desc Get orders for tenant
// @route GET /api/orders/tenant/:id
exports.getOrdersByTenant = async (req, res) => {
  try {
    const orders = await MealOrder.find({ tenantId: req.params.id }).sort({ date: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Calculate monthly mess bill
// @route GET /api/mess/bill/:tenantId
exports.calculateBill = async (req, res) => {
  try {
    const tenantId = req.params.tenantId;
    const { month, year } = req.query; // expecting month as 1-12
    
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
