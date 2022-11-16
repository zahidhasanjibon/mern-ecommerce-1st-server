// external
const express = require('express');
const path = require('path')
const cookieParser = require('cookie-parser');
const fileUpload = require("express-fileupload")

if (process.env.NODE_ENV !== "PRODUCTION") {
    // config
    require("dotenv").config({ path: "backend/config/config.env" });
  }
const app = express();
app.use(express.json({limit: "50mb"}));
app.use(express.urlencoded({ limit: "50mb",extended: true }));
app.use(cookieParser());
app.use(fileUpload())

// internal import
const errorHandler = require('./middlewares/error');
const productRoute = require('./routes/productRoute');
const userRoute = require('./routes/userRoute');
const orderRoute = require('./routes/orderRoute');
const paymentRoute = require("./routes/paymentRoute")

// api routes
app.use('/api/v1', productRoute);
app.use('/api/v1', userRoute);
app.use('/api/v1', orderRoute);
app.use('/api/v1',paymentRoute)

app.use(express.static(path.join(__dirname,'../frontend/build')))
app.get('*',(req,res) => {
    res.sendFile(path.resolve(__dirname,'../frontend/build/index.html'))
})
app.use(errorHandler);
module.exports = app;
