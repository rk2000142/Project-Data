const mongoose = require("mongoose")
const productModel = require("../Model/productModel")

const addproduct = async (req,res)=>{
    data = req.body
    let created = await productModel.create(data)
    res.status(201).send({ status: true, message: 'Product Created Successfully', data: created })
} 







const getByQuery= async function(req,res){
    try {
        let query = req.query


        if (query.size) {
            let sizes= ["S", "XS", "M", "X", "L", "XXL", "XL"]
            if(!sizes.inclides(query.size)) return res.status(400).send({status:false,message:"no"})
        }

        if (query.name) {
            if (!isValid(query.name)) return res.status(400).send({ status: false, message: "name should be in string & not empty" })
        }

        let allProducts = await productModel.find({ $and: [query, { isDeleted: false },{price:{$gt:query.priceGraterThan,$lt:query.priceLessThan}}] }).sort({ "price": query.priceSort })
        if (allProducts.length == 0) return res.status(404).send({ status: false, message: "no such Product" })

        res.status(200).send({ status: true, message: "Success", data: allProducts })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}


const updateProduct = async function(req,res){
    try{
        let productId = req.params.productId
        let data = req.body
        if (!productId) return res.status(400).send({ status: false, message: "provide productId" })
        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "invalid productId" })
        let checkId = await productModel.findById({ _id: productId })
        if (!checkId) return res.status(404).send({ status: false, message: "no such product" })
        if (checkId.isDeleted == true) return res.status(404).send({ status: false, message: "product is already deleted" })

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "please provide data to update" })

        let { title, description, price, isFreeShipping, productImage, style, availableSizes, installments  } = req.body

        if (title) {
            if (title == "") return res.status(400).send({ status: false, message: "title can't be empty" })
            if (!isValid(title)) return res.status(400).send({ status: false, message: "title should be in string & not empty" })
            let checkTitle = await productModel.findOne({ title })
            if (checkTitle) { return res.status(400).send({ status: false, message: "This title is already present" }) }
        }

        let updateData = await productModel.findOneAndUpdate({
            _id: productId
        }, 
        data,
        { new: true })
        res.status(200).send({ status: true, message: "product updated", data: updateData })

    }catch(error){
        res.status(500).send({ status: false, message: error.message })
    }
}

const deleteProduct = async function (req,res){
    try{
        let productId = req.params.productId
        let data = req.body
        if (!productId) return res.status(400).send({ status: false, message: "provide productId" })
        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "invalid productId" })
        let checkId = await productModel.findById({ _id: productId })
        if (!checkId) return res.status(404).send({ status: false, message: "no such product" })
        if (checkId.isDeleted == true) return res.status(404).send({ status: false, message: "product is already deleted" })

        let deletedDoc= await productModel.findByIdAndUpdate({_id:productId},{isDeleted:true,deletedAt:Date.now()},{new:true})
        console.log(deletedDoc)
        res.status(200).send({status:true,message:"product is deleted"})
    }catch(error){
        res.status(500).send({ status: false, message: error.message })
    }
}
  
module.exports = {addproduct,getByQuery,getProfileById,updateProduct,deleteProduct}
