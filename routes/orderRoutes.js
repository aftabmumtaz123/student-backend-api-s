const router = require('express').Router();
const mongoose = require("mongoose");


const Order = require('../models/Order')
const Product = require('../models/Product')

router.get('/', async (req, res) => {
    try {
        const orders = await Order.find();

        res.status(200).json({
            success: true,
            message: "Orders fetched successfully",
            orders: orders
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            orders: []
     
        })
    }
})



router.post("/", async (req, res) => {
  try {
    const { products, status } = req.body;

    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Products must be a non-empty array"
      });
    }

    
    const invalidIds = products.filter(p =>
      !mongoose.Types.ObjectId.isValid(p.productId)
    );

    if (invalidIds.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid productId format",
        invalidIds
      });
    }

    
    const merged = {};
    products.forEach(p => {
      if (!merged[p.productId]) {
        merged[p.productId] = { ...p };
      } else {
        merged[p.productId].quantity += p.quantity;
      }
    });

    const finalProducts = Object.values(merged);

    
    const productIds = finalProducts.map(p => p.productId);

    
    const existingProducts = await Product.find({
      _id: { $in: productIds }
    });

    
    if (existingProducts.length !== productIds.length) {
      return res.status(404).json({
        success: false,
        message: "Some products do not exist"
      });
    }

    
    const priceMap = {};
    existingProducts.forEach(p => {
      priceMap[p._id.toString()] = p.price;
    });

    
    let totalAmount = 0;

    finalProducts.forEach(p => {
      const price = priceMap[p.productId];
      p.price = price; 
      totalAmount += price * p.quantity;
    });

    
    const bulkOps = finalProducts.map(p => ({
      updateOne: {
        filter: {
          _id: p.productId,
          stock: { $gte: p.quantity }
        },
        update: {
          $inc: { stock: -p.quantity }
        }
      }
    }));

    const result = await Product.bulkWrite(bulkOps);

    if (result.modifiedCount !== finalProducts.length) {
      return res.status(400).json({
        success: false,
        message: "Some products are out of stock"
      });
    }

    
    const order = await Order.create({
      products: finalProducts,
      totalAmount,
      status
    });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
});



module.exports = router