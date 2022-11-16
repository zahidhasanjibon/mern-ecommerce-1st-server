const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
const ErrorHandler = require("../utils/errorHandler")

exports.processPayment = async (req,res,next) => {
   try {
        const myPayment = await stripe.paymentIntents.create({
            amount:req.body.amount,
            currency:"inr",
            metadata:{
                company:"Ecommerce"
            }
        })

        res.status(200).json({
            success:true,
            client_secret:myPayment.client_secret
        })

    
   } catch (error) {
    return next(new ErrorHandler(error.message, 500));
   }
}

exports.sendStripeApiKey = (req,res,next) => {
    res.status(200).json({
        stripeApiKey:process.env.STRIPE_API_KEY
    })
}