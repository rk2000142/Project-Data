const mongoose = require("mongoose")
const authorModel = require("../models/authorModel")
const blogsModel = require("../models/blogsModel")




const isValidRequestBody= function(requestBody){
    return Object.keys(requestBody).length >0
  }

//========================================= 3-CreateBlog Api =========================================================//


  const createBlogs = async function (req, res) {
    try { 
      const requestBody=req.body;
      if (!isValidRequestBody(requestBody)){
        res.status(400).send({status : false, msg : "Please provide Blogs details" })
      }
      let {title, body, authorId, tags, category, subcategory, isPublished} = requestBody   //Object Destructuring


        //title validation
        if (!title) {
            return res.status(400).send({ status: false, msg: " title is required" });
        }
        
        //body validation
        if (!body) {
            return res.status(400).send({ status: false, msg: "body is required" });
        }
        
        //Author id validation
        let authorData = req.body.authorId;
        if (!authorData) {
            return res.status(400).send({ status: false, msg: "authorId is required" });
        }
        if (!mongoose.isValidObjectId(authorId)) {
            return res.status(400).send({ status: false, msg: "Enter a Valid AuthorId" })
        }
        const check = await authorModel.findById({ _id: authorData }).select(({ _id: 1 }))
        if (!check) {
            return res.status(404).send({ status: false, msg: "not a valid Author" })
        }

        //category validation
        if (!category) {
            return res.status(400).send({ status: false, msg: " category is required" });
        }
        if (!category.match(/^[a-zA-Z]+$/)) {
            return res.status(400).send({ status: false, msg: "enter valid catagory" });
        }

        let blogData= {
            title, 
            body, 
            authorId, 
            tags, 
            category,
            subcategory,  
            isPublished: isPublished ? isPublished : false,
            publishedAt: isPublished ? new Date() : null
        }
  
        // checking if the given blogData is already exists 
        let checkBlog = await blogsModel.findOne(blogData)
        if (checkBlog) {
            return res.status(400).send({ status: false, msg: "Blog already exists" })
        }

        //Blogs creation
        let savedData = await blogsModel.create(blogData)
        res.status(201).send({ status: true, data: savedData })
    }

    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}





//========================================= 4-Get Blogs Data =========================================================//


const getBlogs = async function (req, res) {
    try {

        //filter the data which isn't deleted and being published
        const filterQuery= { isPublished: true, isDeleted: false }
        let queryparams = req.query;

        if (isValidRequestBody(queryparams)){
            let category = req.query.category
            let authorId = req.query.authorId
            let tags = req.query.tags
            let subcategory = req.query.subcategory
        

        if (authorId && mongoose.isValidObjectId(authorId)){
            filterQuery['authorId']= authorId
        }
        if (category){
            filterQuery['category']=category.trim()
        }
        if (tags){
            const tagsArr =tags.trim().split(',').map(tag=> tag.trim())
            filterQuery['tags']={$all: tagsArr}
        }
        if (subcategory){
            const subcatArr =subcategory.trim().split(',').map(subcat=> subcat.trim())
            filterQuery['subcategory']={$all: subcatArr}
        }
    }
        const blogs= await blogsModel.find(filterQuery)

        if (Array.isArray(blogs) && blogs.length==0){
            return res.status(404).send({ data: "No such document exist with the given attributes." });
        }

        res.status(200).send({ status: true, data: blogs })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
} 





//========================================= 5-UpdateBlogs Api =========================================================//


const updateBlogs = async function (req, res) {
    try {
        let blogId = req.params.blogId

        const data = req.body;
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Provide data details" });
        }
        if (data.category || data.authorId) {
            return res.status(400).send({ status: false, msg: "You cannot change authorId or category" });
        }
        if (!data) return res.status(400).send({ status: false, msg: "Bad Request" });

        let updatedDetails = await blogsModel.findOneAndUpdate({ _id: blogId },
            {
                title: data.title,
                body: data.body,
                $push: { tags: data.tags, subcategory: data.subcategory }, //$push used because it is assumed that data is getting added 
                isPublished: true,
                publishedAt: new Date(),
            },
            { new: true, upsert: true }
        ); 
        res.status(200).send({ status: true, data: updatedDetails });
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}





//====================================== 6-DeletedBlog By Path Param Id =============================================//


let deleteBlogs = async function (req, res) {
    try {
        let id = req.params.blogId
        
        //finding id in database  
        let idvalidation = await blogsModel.findById(id)
        
        if (idvalidation.isDeleted == false) {
            let validetion = await blogsModel.findOneAndUpdate({ _id: id }, { $set: { isDeleted: true, deletedAt: new Date() } }, { new: true })
        }
        return res.status(200).send()

    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}




//===================================== 7-DeletedBlog By Query Param ============================================//


const queryDeleted = async function (req, res) {
    try {
        let category = req.query.category
        let authorId = req.query.authorId
        let tags = req.query.tags
        let subcategory = req.query.subcategory
        let isPublished = req.query.isPublished
        
        let data = await blogsModel.find({ $or: [{ category: category }, { authorId: authorId }, { tags: tags }, { subcategory: subcategory }, { isPublished: isPublished }] });
        if (!data) {
            return res.send({ status: false, message: "no such data exists" })
        }
        let Update = await blogsModel.updateMany({ $or: [{ category: category }, { authorId: authorId }, { tags: tags }, { subcategory: subcategory }, { isPublished: isPublished }] }, { $set: { isDeleted: true }, deletedAt: new Date() }, { new: true })
        if (Update.modifiedCount == 0) {
            return res.status(404).send({ status: true, msg: "no such data available now" })
        }
        // res.send({ status: true, data: Update })  
    }
    catch (err) {
        res.status(500).send({ status: false, Error: err.message })
    }
} 



module.exports.createBlogs = createBlogs
module.exports.getBlogs = getBlogs
module.exports.updateBlogs = updateBlogs
module.exports.deleteBlogs = deleteBlogs
module.exports.queryDeleted = queryDeleted