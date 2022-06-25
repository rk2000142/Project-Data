const mongoose = require("mongoose")
const authorModel = require("../models/authorModel")
const blogsModel = require("../models/blogsModel")



const createBlogs = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, msg: "Please provide details" });
        }

        if (!data.title) {
            return res.status(400).send({ status: false, msg: " title is required" });
        }
        if (!isNaN(data.title)) {
            return res.status(400).send({ status: false, msg: "enter valid title" });
        }

        if (!data.body) {
            return res.status(400).send({ status: false, msg: "body is required" });
        }
        if (!isNaN(data.body)) {
            return res.status(400).send({ status: false, msg: "enter valid body" });
        }

        let authorData = req.body.authorId;
        if (!authorData) {
            return res.status(400).send({ status: false, msg: "authorId is required" });
        }
        if (!mongoose.isValidObjectId(data.authorId)) {
            return res.status(400).send({ status: false, msg: "Enter a Valid AuthorId" })
        }
        const check = await authorModel.findById({ _id: authorData }).select(({ _id: 1 }))
        if (!check) {
            return res.status(404).send({ status: false, msg: "not a valid Author" })
        }

        if (!data.category) {
            return res.status(400).send({ status: false, msg: " category is required" });
        }
        if (!isNaN(data.category)) {
            return res.status(400).send({ status: false, msg: "enter valid catagory" });
        }


        let checkBlog = await blogsModel.findOne(data)
        if (checkBlog) {
            return res.status(400).send({ status: false, msg: "Blog already exists" })
        }

        let savedData = await blogsModel.create(data)
        res.status(201).send({ status: true, data: savedData })

    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}






const getBlogs = async function (req, res) {
    try {
        let data = req.query;
        // let authorId = req.query.authorId
        // if (!mongoose.isValidObjectId(data.authorId)) return res.send({status: false, msg:"wrong author id"})
        // let valid = await authorModel.findById(authorId)
        // if (!valid) {
        //     return res.status(404).send({ status: false, msg: "enter valid authorID" })
        // }

        let getBlog = await blogsModel.find({ $and: [data, { isPublished: true, isDeleted: false }] }).populate("authorId")
        if (getBlog.length == 0) {
            return res.status(404).send({ data: "No such document exist with the given attributes." });
        }
        res.status(200).send({ status: true, data: getBlog })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
} 






const updateBlogs = async function (req, res) {
    try {
        let blogId = req.params.blogId
        // if (!blogId) {
        //     return res.status(400).send({ status: false, data: "Please enter a blog id" })
        // }

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
                $push: { tags: data.tags, subcategory: data.subcategory },
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






let deleteBlogs = async function (req, res) {
    try {
        let id = req.params.blogId
        

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
        let Update = await blogsModel.updateMany({ $or: [{ category: category }, { authorId: authorId }, { tags: tags }, { subcategory: subcategory }, { isPublished: isPublished }] }, { $set: { isDeleted: true } }, { new: true })
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
