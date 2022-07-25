const express = require("express");  //post,get 
const router = express.Router();
const userController=require("../controllers/userController")
const middleware = require("../middleware/auth")



router.post("/login",userController.userLogin)

router.get("/user/:userId/profile",middleware.authentication,userController.getProfile)

module.exports = router;

