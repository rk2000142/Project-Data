const authorModel = require("../models/authorModel")
const blogsModel = require("../models/blogsModel")
const { createAuthor } = require("./authorcontroller")

const createBlogs = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) {
            return res.status(400).send({ status: false, data: "Provide data details" });
        }

        if (!data.title) {
            return res.status(400).send({ status: false, data: " title is required" });
        }
        if (Object.keys(data.title).length == 0 || data.title.length == 0) {
            return res.status(400).send({ status: false, data: "Enter a valid title" });
        }

        if (!data.body) {
            return res.status(400).send({ status: false, data: "body is required" });
        }
        if (Object.keys(data.body).length == 0 || data.body.length == 0) {
            return res.status(400).send({ status: false, msg: "Enter a valid body" });
        }

        let authorData = req.body.authorId;
        if (!authorData) {
            return res.status(400).send({ status: false, data: "authorId is required" });
        }
        if (Object.keys(authorData).length == 0 || authorData.length == 0) {
            return res.status(400).send({ status: false, data: "Enter a valid authorId" });
        }
        const check = await authorModel.findById({ _id: authorData }).select(({ _id: 1 }))
        if (!check) {
            return res.status(404).send({ status: false, msg: "not a valid Author" })
        }

        if (!data.category) {
            return res.status(400).send({ status: false, data: "data category is required" });
        }
        if (Object.keys(data.category).length == 0 || data.category.length == 0) {
            return res.status(400).send({ status: false, data: "Enter a valid category" });
        }

        let savedData = await blogsModel.create(data)
        res.status(201).send({ status: true, msg: savedData })
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }
}






const getBlogs = async function (req, res) { 
    try {
        let query = req.query;
        let getBlog = await blogsModel.find({ $and: [{ isPublished: true, isDeleted: false, ...query }] }).populate("authorId")
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
        if (!blogId) {
            return res.status(400).send({ status: false, data: "Please enter a blog id" })
        }
        let blog = await blogsModel.findById(blogId)
        if (!blog) return res.status(404).send("id is incorrect")
        if (blog.isDeleted) return res.status(404).send("id is incorrect")

        const data = req.body;
        if (data.category || data.authorId) {
            return res.status(400).send({status:false, data: "You cannot change authorId or category"});
        }
        if (!data) return res.status(400).send({ status: false, msg: "Bad Request" });

        let updatedDetails = await blogsModel.findOneAndUpdate({ _id: blogId },
            {
                title: data.title,
                body: data.body,
                $push: {tags: data.tags,subcategory: data.subcategory},
                isPublished: true,
                publishedAt: new Date(),
            },
            { new: true, upsert: true }
        );
        res.status(200).send({ status: true, data: updatedDetails });
    }
    catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
}






let deleteBlogs = async function (req, res) {
    try {
        let id = req.params.blogId
        if (!id) return res.status(404).send({ sataus: false, msg: "blog id is required" })

        let idvalidation = await blogsModel.findById(id)
        if (!idvalidation) return res.status(404).send({ status: false, msg: "invalid blog id" })

        if (idvalidation.isDeleted == true) return res.status(404).send({ status: false, msg: "blog is allready deleted" })
        if (idvalidation.isDeleted == false) {
            let validetion = await blogsModel.findOneAndUpdate({ _id: id }, { $set: { isDeleted: true, deletedAt: new Date() } },{ new: true })
        }
        return res.status(200).send({ status: true, msg: "blog is deleted successfully" })
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
        if(Update.modifiedCount==0){
            return res.status(404).send({status:false, msg:"no such data available"})
        }
        res.send({ status: true, data: Update })  
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
