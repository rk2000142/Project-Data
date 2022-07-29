const cardModel = require("../Model/cartModel");
const productModel = require("../Model/productModel")
const mongoose = require("mongoose")

const createCart = async function (req, res) {
  try {
    data= req.body
    const createdata = await cardModel.create(data)
    return res.status(201).send({status:true, message:"Success",data:createdata})
    
  } catch (err) {
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
