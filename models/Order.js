const mongoose = require('mongoose')
const orderSchema = new mongoose.Schema({
  products: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product"
      },
      quantity: Number,
      price: Number
    }
  ],
  totalAmount: Number,
  status: {
    type: String,
    enum: ["pending", "completed"],
    default: "pending"
  }
}, { timestamps: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order