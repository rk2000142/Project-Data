const jwt = require("jsonwebtoken");
const blogsModel = require("../models/blogsModel") 

const authenticate = async function (req, res, next) {
  try {
    let token = req.headers["x-Api-Key"];
    if (!token) {
      token = req.headers["x-api-key"];
    }
    //If no token is present in the request header return error
    if (!token) {

      return res.status(400).send({ status: false, msg: "token must be present" });
    }
    
    try {
      let decodedToken = jwt.verify(token, "functionUp-radon");
    }
    catch {
      return res.status(500).send({ status: false, msg: "token is invalid" });
    }
  }
  catch (error) {
    console.log(error.message)
    res.status(500).send({ msg: " Server Error", error: error.message })
  }
  next()
}





const authorise = async function (req, res, next) {
  try {
    let token = req.headers["x-api-key"];
    if (!token) {
      return res.status(400).send({ status: false, msg: "token must be present" });
    }
    let decodedToken = jwt.verify(token, "functionUp-radon");

    let blogId = req.params.blogId
    // if (Object.keys(blogId).length == 0) {
    //   return res.status(404).send({ status: false, msg: "blogId does not exists" })
    // }
    let blog = await blogsModel.findById(blogId)

    if (!blog) {
      return res.status(404).send({ status: false, msg: "blog does not exists" })
    }
    if (blog.isDeleted) {
      return res.status(404).send( {status: false, msg: "blog is already deleted"} )
    }
    
    let authorLoggedIn = decodedToken.authorId

    if (blog.authorId != authorLoggedIn) {
      return res.status(403).send({ status: false, msg: 'author logged is not allowed to modify the requested users data' })
    }
    next()
  }
  catch (error) {
    res.status(500).send({ msg: error.message })
  }
}




module.exports.authenticate = authenticate
module.exports.authorise = authorise
