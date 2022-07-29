const express = require("express");  //post,get 
const router = express.Router();
const userController = require("../controllers/userController")
const productController = require("../controllers/productController")
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
<<<<<<< HEAD
router.put("products/:productId",productController.updateProduct)
=======
router.put("/products/:productId",productController.updateProduct)
>>>>>>> a64c916da492d094c3117a1a846bdc235aa84cbb
router.delete("/products/:productId",productController.deleteProduct)
module.exports = router;
