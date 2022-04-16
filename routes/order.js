const express = require("express");
const router = express.Router();

const {newOrder, getSingleOrder, getLoggedInUser, getLoggedInUserOrder, allOrders, updateOrder, deleteOrder } = require('../controllers/orderController')

const { isAuthenticated, authorizedRoles } = require('../middlewares/auth');

router.route('/order/new').post(isAuthenticated, newOrder);

router.route('/order/:id').get(isAuthenticated, getSingleOrder);
router.route('/orders/me').get(isAuthenticated, getLoggedInUserOrder);
router.route('/admin/orders').get(isAuthenticated, authorizedRoles('admin'), allOrders);
router.route('/admin/order/:id').put(isAuthenticated, authorizedRoles('admin'), updateOrder);
router.route('/admin/order/:id').delete(isAuthenticated, authorizedRoles('admin'), deleteOrder);

module.exports = router
