const express = require("express");  //post,get 
const router = express.Router();
const userController = require("../controllers/userController")
const productController = require("../controllers/productController") 
const cartController = require("../controllers/cartController")
const middleware = require("../middleware/auth")

//USER
router.post("/register", userController.registerUser)
router.post("/login", userController.userLogin)
router.get("/user/:userId/profile", middleware.authentication, userController.getProfile)
router.put("/user/:userId/profile", middleware.authentication, userController.updatedProfile)

//PRODUCT 
router.post("/products",productController.addproduct)
router.get("/products",productController.getByQuery)
router.get('/products/:productId', productController.getProductsById)
router.put("/products/:productId",productController.updateProduct)
router.delete("/products/:productId",productController.deleteProduct)
 
//CARD
router.post("/users/:userId/cart",middleware.authentication, cartController.createCart)
router.put("/users/:userId/cart" ,middleware.authentication,cartController.updateCart)
router.get("/users/:userId/cart",middleware.authentication,cartController.getCart)
router.delete("/users/:userId/cart",middleware.authentication,cartController.deleteCart)
module.exports = router;
