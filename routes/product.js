const express = require("express");
const router = express.Router();

const {
  getProducts,
  newProduct,
  getSingleProduct,
  updateProducts,
  deleteProduct,
  createProductReview,
  getProductReview,
  deleteReview,
} = require("../controllers/productController");

const { isAuthenticated, authorizedRoles } = require("../middlewares/auth");

router.route("/products").get(getProducts);
router.route("/product/:id").get(getSingleProduct);

router
  .route("/admin/product/new")
  .post(isAuthenticated, authorizedRoles("admin"), newProduct);

router
  .route("/admin/product/:id") 
  .put(isAuthenticated, authorizedRoles("admin"), updateProducts);
router
  .route("/admin/product/:id")
  .delete(isAuthenticated, authorizedRoles("admin"), deleteProduct);
router
  .route("/review")
  .put(isAuthenticated, createProductReview);
router
  .route("/reviews")
  .get(isAuthenticated, getProductReview);
router.route("/reviews").delete(isAuthenticated, deleteReview);

module.exports = router;
