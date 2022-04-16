const Order = require("../models/order");
const Product = require("../models/product");
const catchAsyncErrors = require("../middlewares/catchAsyncErrors");
const ErrorHandler = require("../utils/errorHandler");

// create a new order  => /api/v1/order/new

exports.newOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body;
  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(200).json({
    success: true,
    order,
  });
});

// Get single order

exports.getSingleOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }
  res.status(200).json({
    success: true,
    order,
  });
});
exports.getLoggedInUserOrder = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({ user: req.user.id });

  res.status(200).json({
    success: true,
    orders,
  });
});

exports.allOrders = catchAsyncErrors(async (req, res, next) => {
  const orders = await Order.find({});

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount += order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
});

// update / process order
exports.updateOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (order.OrderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }
  order.orderItems.forEach(async (item) => {
    await updateStock(item.product, item.quntity);
  });

  (order.orderStatus = req.body.status), (order.deliveredAt = Date.now());

  await order.save();

    res.status(200).json({ 
      success: true
  });
});

async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock = product.stock - quantity;

  await product.save({validateBeforeSave:false});
}
 

exports.deleteOrder = catchAsyncErrors(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
   
  if (!order) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }
    
    await order.remove()

  res.status(200).json({
    success: true,
   
  });
});