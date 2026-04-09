require('dotenv').config()
const mongoose = require('mongoose')

mongoose.connect(process.env.MONGO_URI).then(()=>{
    console.log(`Database connected successfully`)
}).catch((e)=>{
    console.log(`There's some error while connecting to the database`)
})




