const cardModel = require("../Model/cartModel");
const productModel = require("../Model/productModel")
const mongoose = require("mongoose");
const userModel = require("../Model/userModel");
const cartModel = require("../Model/cartModel");

const isValidObjectId = function (ObjectId) {
  return mongoose.Types.ObjectId.isValid(ObjectId);
}

const isValidRequestBody = function (request) {
  return Object.keys(request).length > 0;
}

const createCart = async function (req, res) {
  try {
    data = req.body
    userId = req.params.userId
    if (!userId) return res.status(400).send({ status: false, message: 'Please provide userId' })
    if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'Please provide valid userId' })
    let userCheck = await userModel.findById(userId)
    if (!userCheck) return res.status(404).send({ status: false, message: "no user found" })
    if (req.tokenId != userId) return res.status(403).send({ status: false, message: "you are unauthorized" })
    data.userId = userId

    if (!isValidRequestBody(data)) return res.status(400).send({ status: false, message: "provide data to create cart" })
    data.totalItems = data.items.length
    data.totalPrice = 0

    for (let i = 0; i < data.items.length; i++) {
      if (!data.items[i].productId) return res.status(400).send({ status: false, message: 'Please provide productId' })
      if (!isValidObjectId(data.items[i].productId)) return res.status(400).send({ status: false, message: 'Please provide valid productId' })
      let productCheck = await productModel.findById(data.items[i].productId)
      if (!productCheck) return res.status(404).send({ status: false, message: ` product ${data.items[i].productId} not found` })
      if (productCheck.isDeleted == true) return res.status(404).send({ status: false, message: `${data.items[i].productId} this product is deleted` })
      data.totalPrice += productCheck.price * data.items[i].quantity
    }

    let cartCheck = await cartModel.findOne({ userId: userId })
    if (cartCheck) {

    }else{
      const createData = await cardModel.create(data)
      return res.status(201).send({ status: true, message: "Success", data: createData })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).send({ status: false, message: err.message });
  }
};



const updateCart = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
const getCart = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};
const deleteCart = async function (req, res) {
  try {
  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createCart, updateCart, getCart, deleteCart };
