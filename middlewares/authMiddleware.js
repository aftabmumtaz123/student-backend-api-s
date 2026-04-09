require('dotenv').config()
const jwt = require("jsonwebtoken");


const authentication = (req, res, next) => {
    try {
        const token = req.cookies.Token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.userId
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: "server error",
            error: error.message
        });
    }

}


module.exports = authentication;