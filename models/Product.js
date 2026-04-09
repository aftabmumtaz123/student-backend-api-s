const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    description: String,
    price: { 
        type: Number, 
        required: true 
    },
    category: {
        type: String,
        enum: ["electronics", "accessories", "clothing"],
        default: "accessories"
    },
    stock: { 
        type: Number, 
        default: 0 
    },
    images: { 
        type: [String], 
        default: [] 
    },
    isActive: { 
        type: Boolean, 
        default: true 
    }
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);

module.exports = Product;