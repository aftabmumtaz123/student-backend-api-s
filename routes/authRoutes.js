const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const authentication = require('../middlewares/authMiddleware')

const router = require('express').Router()

router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body
        const isUser = await User.findOne({ email })
        if (isUser) return res.json({ success: false, message: "User already exist" })

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword
        })

        await user.save();

        res.json({
            success: true,
            message: "User registered successfully",
            user
        })
    } catch (error) {
        res.json({
            success: false,
            message: "server error",
            error: error.message
        })
    }
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const isUser = await User.findOne({ email });

        if (!isUser) {
            return res.json({
                success: false,
                message: "Invalid credentials"
            })
        }


        const isValidPassword = await bcrypt.compare(password, isUser.password)
        if (!isValidPassword) {
            return res.json({
                success: false,
                message: "Invalid credentials"
            })
        }



        const token = jwt.sign(
            { userId: isUser._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );

        res.cookie("Token", token, {
            httpOnly: true,
            secure: false,
            sameSite: 'strict'
        })


        res.status(200).json({
            success: true,
            message: "Logged in successfully",
            user: {
                _id: isUser._id,
                email: isUser.email
            },
            token
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        })
    }
})


router.get('/login', (req, res) => {
  res.render('auth');   // renders views/auth.ejs
});


router.get('/', authentication, async (req, res) => {

    const users = await User.find().select("-password");

    const totalUsers = await User.find().countDocuments();

    res.status(200).json({
        success: true,
        message: "Protected route is hitting ",
        data: users,
        totalUsers
    })
})


router.post('/logout', (req, res) => {
    try {
        res.clearCookie("Token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict"
        });

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Logout failed",
            error: error.message
        });
    }
})


module.exports = router