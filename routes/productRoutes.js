const Product = require('../models/Product')
const router = require('express').Router();
const auth = require('../middlewares/authMiddleware')


router.post('/', auth , async (req, res) => {
    try {
        const { name, description, stock, price, category, isActive, images } = req.body;


        if(!name && !price){
             return res.status(400).json({
                success: false,
                message: "Name and price are required"
            });
        }


        const product = await Product.findOne({ name })
        if (product) {
            return res.status(409).json({
                success: false,
                message: "This product already exist",
                product
            })
        }

        const newProduct = new Product({
            name,
            description,
            stock,
            price,
            category,
            isActive: true,
            images
        })

        await newProduct.save()


        res.status(201).redirect('/api/products');

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
})


router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 20 } = req.query;

        const products = await Product.find()
            .sort({ createdAt: -1 })
            .skip((page - 1) * Number(limit))
            .limit(Number(limit));

        const total = await Product.countDocuments();

        
        res.status(200).json({
            success: true,
            message: "Products fetched successfully",
            products: products,
            total: total,
            currentPage: 'products',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
});


router.get('/:id', auth ,async (req,res)=>{

    try {
        const id = req.params.id;
        const product = await Product.findById(id);

        res.status(200).json({
            success: true,
            message: "Product fetched successfully",
            product
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "server error",
            error: error.message
        })
    }
})


router.put('/:id', auth , async (req,res) => {
    try {
        const id = req.params.id;
        const isProduct = await Product.findOne({_id: id});
        if(!isProduct){
            return res.status(409).json({
                success: false,
                message: "This product is not exist"
            })
        }
        const product = await Product.findByIdAndUpdate(
            id,
            req.body,
            {new: true, runValidators: true}
        );

        res.status(200).redirect('/api/products');
    } catch (error) {
        res.status(500).json({
            success: true,
            message: "Server error"
        })
    }
})



router.delete('/:id', auth , async (req,res)=>{
    try {
        const id = req.params.id;
        const isProduct = await Product.findOne({_id: id});
        if(!isProduct){
            return res.status(409).json({
                success: false,
                message: "This product is not exist"
            })
        }

        const product  =  await Product.findByIdAndDelete({_id: id})

        res.status(200).json({
            success: true,
            message: "Product deleted successfully",
            product
        })
        

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
})

module.exports = router