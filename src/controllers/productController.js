const mongoose = require("mongoose")
const productModel = require("../Model/productModel")

const addproduct = async (req,res)=>{
    data = req.body
    let created = await productModel.create(data)
    res.status(201).send({ status: true, message: 'Product Created Successfully', data: created })
} 
  
module.exports = {addproduct}
