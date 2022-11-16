const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHandler = require("../utils/errorHandler");

// create new order

exports.newOrder = async (req, res, next) => {
  try {
    const {
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      totalPrice,
      shippingprice,
    } = req.body;
    const order = await Order.create({
      shippingInfo,
      orderItems,
      paymentInfo,
      itemsPrice,
      taxPrice,
      totalPrice,
      shippingprice,
      paidAt: Date.now(),
      user: req.user._id,
    });
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// get single order
exports.getSingleOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "name email"
    );
    if (!order) {
      return next(
        new ErrorHandler(`order not found with this ${req.params.id}`, 404)
      );
    }
    return res.status(200).json({
      success: true,
      order,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};
// get loggedin user all order / my order
exports.myOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id });

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};
// get all orders --(admin)
exports.getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find();
    let totalAmount = 0;
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });

    return res.status(200).json({
      success: true,
      orders,
      totalAmount,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};
// update product status (utility function)
async function updateStock(id, quantity, next) {
  try {
    const product = await Product.findById(id);
    product.stock -= quantity;
    return await product.save({ validateBeforeSave: false });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
}
// update order status --(admin)
exports.updateOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next(
        new ErrorHandler(`order not found with id ${req.params.id} `, 404)
      );
    }
    if (order.orderStatus === "Delivered") {
      return next(new ErrorHandler(`you already delivered this order`, 400));
    }
    if (req.body.status === "Shipped") {
      order.orderItems.forEach(async (orderr) => {
        await updateStock(orderr.product, orderr.quantity, next);
      });
    }

    order.orderStatus = req.body.status;
    if (req.body.status === "Delivered") {
      order.deliveredAt = Date.now();
    }

    await order.save({ validateBeforeSave: false });

    return res.status(200).json({
      success: true,
    });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};

// delete order -- admin
exports.deleteOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(
        new ErrorHandler(`order not found with id ${req.params.id} `, 404)
      );
    }
    await order.remove();
    return res.status(200).json({ success: true });
  } catch (error) {
    return next(new ErrorHandler(error.message, 500));
  }
};
