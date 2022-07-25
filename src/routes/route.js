const express = require("express");  //post,get 
const router = express.Router();
const { userlogin } = require("../controllers/userController");

 
router.get("/test-me", function (req, res) {
    res.send("My first ever api!")
}) 
module.exports = router;
  
    

