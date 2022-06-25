const express = require('express');
const router = express.Router();

const AuthController= require("../controllers/authorcontroller")
const BlogsController= require("../controllers/blogscontroller")
const MW= require("../middleware/auth")


router.post("/authors", AuthController.createAuthor )
router.post("/blogs",MW.authenticate, BlogsController.createBlogs )
router.get("/blogs",MW.authenticate, BlogsController.getBlogs )
router.put("/blogs/:blogId",MW.authenticate,MW.authorise, BlogsController.updateBlogs )
router.delete("/blogs/:blogId",MW.authenticate,MW.authorise, BlogsController.deleteBlogs )
router.delete("/blogs",MW.authenticate,MW.authorise, BlogsController.queryDeleted )

router.post("/login", AuthController.loginAuthor)

module.exports = router; 

