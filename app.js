require('dotenv').config()
const express = require('express')
const cookieParser = require('cookie-parser')
const morgan = require('morgan')

require('./utils/connection')

const app = express();
app.use(morgan("tiny"))

app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use(cookieParser())
const port = process.env.PORT;



app.use("/api/auth", require('./routes/authRoutes'))
app.use("/api/products", require('./routes/productRoutes'))
app.use("/api/dashboard", require('./routes/dashboardRoute'))
app.use('/api/orders', require('./routes/orderRoutes'))
app.use('/admin/analytics', require('./routes/analyticsRoute'))

app.listen(port, () => {
    console.log(`Hey I am running on port ${port}`)
})