const express = require('express');
const router = express.Router();

const AuthController= require("../controllers/authorcontroller")
const BlogsController= require("../controllers/blogscontroller")


router.post("/authors", AuthController.createAuthor )
router.post("/blogs", BlogsController.createBlogs )
router.get("/blogs", BlogsController.getBlogs )
router.put("/blogs/:blogId", BlogsController.updateBlogs )
router.delete("/blogs/:blogId", BlogsController.deleteBlogs )
router.delete("/blogs", BlogsController.queryDeleted )

module.exports = router; 

