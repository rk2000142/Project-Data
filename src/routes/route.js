const express = require('express');
const router = express.Router();
const userController=require("../controllers/userController")
const middleware = require("../middleware/auth")








router.get("/user/:userId/profile",middleware.authentication,userController.getProfile)

module.exports = router;