const mongoose = require('mongoose');
const router = require('express').Router();
const Product = require('../models/Product');
const Order = require('../models/Order');

const auth = require('../middlewares/authMiddleware');


router.get('/stats', auth, async (req, res) => {
  try {
    
    const totalProducts = await Product.countDocuments();

    
    const orderCount = await Order.countDocuments();

    
    const revenueResult = await Order.aggregate([
      { $group: { _id: null, total: { $sum: "$totalAmount" } } }
    ]);
    const revenue = revenueResult[0]?.total || 0;

    
    const totalSalesResult = await Order.aggregate([
      { $unwind: "$products" },
      { $group: { _id: null, total: { $sum: "$products.quantity" } } }
    ]);
    const totalSales = totalSalesResult[0]?.total || 0;

    
    const lowStock = await Product.find({ stock: { $lte: 5 } })
      .select('name stock price')
      .lean();
      
    const topSellingAgg = await Order.aggregate([
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

    
    const topSellingProducts = [];
    for (const item of topSellingAgg) {
      const product = await Product.findById(item._id)
        .select('name price')
        .lean();
      
      if (product) {
        topSellingProducts.push({
          ...product,
          sold: item.totalSold
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Dashboard stats fetched successfully",
      stats: {
        totalProducts,
        orderCount,
        revenue,
        totalSales,
        lowStock,
        topSellingProducts   
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error"
    });
  }
});

module.exports = router;