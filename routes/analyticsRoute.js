const router = require('express').Router();
const Product = require('../models/Product');
const Order = require('../models/Order');
const auth = require('../middlewares/authMiddleware');

router.get('/', auth, async (req, res) => {
  try {
    
    
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    const totalOrders = await Order.countDocuments();

    
    const totalProducts = await Product.countDocuments();

    const ordersByStatus = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    const topProducts = await Order.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 }
    ]);

    res.status(200).json({
      success: true,
      message: 'Stats fetched successfully',
      stats: {
        totalRevenue,
        totalOrders,
        totalProducts,
        ordersByStatus,
        topProducts
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal Server Error'
    });
  }
});

  module.exports = router;
