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

const isValid = (value) => {
  if (typeof value === "undefined" || typeof value === "null") return false;
  if (typeof value === "string" && value.trim().length == 0) return false;
  if (typeof value == "string") return true;
}

const createCart = async function (req, res) {
  try {
    let data = req.body
    let userId = req.params.userId
    let createData = {}
    if (!userId) return res.status(400).send({ status: false, message: 'Please provide userId' })
    if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'Please provide valid userId' })
    let userCheck = await userModel.findById(userId)
    if (!userCheck) return res.status(404).send({ status: false, message: "no user found" })
    if (req.tokenId != userId) return res.status(403).send({ status: false, message: "you are unauthorized" })
    createData.userId = userId

    if (!isValidRequestBody(data)) return res.status(400).send({ status: false, message: "provide data to create cart" })


    if (!data.productId) return res.status(400).send({ status: false, message: 'Please provide productId' })
    if (!isValidObjectId(data.productId)) return res.status(400).send({ status: false, message: 'Please provide valid productId' })
    let productCheck = await productModel.findById(data.productId)
    if (!productCheck) return res.status(404).send({ status: false, message: ` product ${data.productId} not found` })
    if (productCheck.isDeleted == true) return res.status(404).send({ status: false, message: `${data.productId} this product is deleted` })
    if (data.quantity || data.quantity == "") {
      if (!/^[0-9]+$/.test(data.quantity)) return res.status(400).send({ status: false, message: "Quantity should be a valid number" })
    }
    let items = [{
      productId: data.productId,
      quantity: data.quantity || 1
    }]
    createData.totalPrice = productCheck.price * (data.quantity || 1)
    createData.totalItems = 1

    createData.items = items

    if (data.cartId || data.cartId == "") {
      if (!isValidObjectId(data.cartId)) return res.status(400).send({ status: false, message: 'Please provide valid cartId' })
      let cartCheck = await cartModel.findOne({ _id: data.cartId, userId: userId })
      if (!cartCheck) return res.status(404).send({ status: false, message: "no cart found" })
    }

    let findCart = await cartModel.findOne({ userId: userId })

    if (findCart || data.cartId) {
      let newItem = findCart.items

      let list = newItem.map((item) => item.productId.toString())
      if (list.find((item) => item == (data.productId))) {
        let updatedCart = await cartModel.findOneAndUpdate({ userId: userId, "items.productId": data.productId },
          {
            $inc: {
              "items.$.quantity": data.quantity||1, totalPrice: createData.totalPrice
            }
          }, { new: true }
        )
        return res.status(201).send({ status: true, message: `Success`, data: updatedCart })

      }
      const updateData = await cartModel.findOneAndUpdate(
        { userId: userId },
        { $inc: { totalPrice: createData.totalPrice, totalItems: createData.totalItems }, $push: { items: createData['items'] } },
        { new: true })
      return res.status(201).send({ status: true, message: "Success", data: updateData })

    } else {
      const result = await cartModel.create(createData)
      return res.status(201).send({ status: true, message: "Success", data: result })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).send({ status: false, message: err.message });
  }
};



const updateCart = async function (req, res) {
  try {
    let data = req.body
    let userId = req.params.userId

    if (!isValidRequestBody(data)) { return res.status(400).send({ status: false, msg: "Product details must need to update" }) }
    if (!mongoose.isValidObjectId(userId)) { return res.status(400).send({ status: false, msg: "need userId" }) }
    const isPresentUser = await userModel.findById({ _id: userId })
    if (!isPresentUser) { return res.status(404).send({ status: false, msg: "User not found" }) }

    const { cartId, productId, removeProduct } = data

    if (!isValid(cartId)) { return res.status(400).send({ status: false, msg: "CardId is required" }) }

    if (!isValid(productId)) { return res.status(400).send({ status: false, msg: "Product Id is requried" }) }

    //if (!(removeProduct)) { return res.status(400).send({ status: false, msg: "Remove product is requried" }) }

    //  if(removeProduct )

    if (!mongoose.isValidObjectId(productId)) { return res.status(400).send({ status: false, msg: "Product Id is invalid" }) }

    if (!mongoose.isValidObjectId(cartId)) { return res.status(400).send({ status: false, msg: "Cart Id is invalid" }) }

    if (!(removeProduct == 0 || removeProduct == 1)) {
      return res.status(400).send({ status: false, msg: "removeProduct value should be either 0 or 1" })
    }

    const isPresentCartId = await cartModel.findOne({ _id: cartId, userId: userId })
    if (!isPresentCartId) { return res.status(404).send({ status: false, msg: "No such cart exist" }) }

    const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
    if (!productDetails) {
      return res.status(404).send({ status: false, msg: "product not exist or deleted" })
    }


    const cart = isPresentCartId.items


    for (let i = 0; i < cart.length; i++) {
      if (cart[i].productId == productId) {
        let changePrice = cart[i].quantity * productDetails.price

        if (removeProduct == 0) {
          const productRemove = await cartModel.findOneAndUpdate({ _id: cartId }, {
            $pull: { items: { productId: productId } },
            totalPrice: isPresentCartId.totalPrice - changePrice, totalItems: isPresentCartId.totalItems - 1
          }, { new: true })
          return res.status(200).send({ status: true, msg: "Remove product Successfully", data: productRemove })
        }

        if (removeProduct == 1) {
          if (cart[i].quantity == 1 && removeProduct == 1) {
            const priceUpdate = await cartModel.findOneAndUpdate({ _id: cartId }, {
              $pull: { items: { productId } },
              totalPrice: isPresentCartId.totalPrice - changePrice, totalItems: isPresentCartId.totalItems - 1
            }, { new: true })
            return res.status(200).send({ status: true, msg: "Remove product and price update successfully", data: priceUpdate })
          }
          cart[i].quantity = cart[i].quantity - 1;
          const cartUpdated = await cartModel.findByIdAndUpdate({ _id: cartId },
            { items: cart, totalPrice: isPresentCartId.totalPrice - productDetails.price }, { new: true })
          return res.status(200).send({ status: true, msg: "One item remove successfully", data: cartUpdated })
        }
      }else{
        return res.status(404).send({status:false,message:"this product is not present in the cart"})
      }
    }

  } catch (err) {
    console.log(err)
    res.status(500).send({ status: false, message: err.message });
  }
}



const getCart = async function (req, res) {
  try {
    userId = req.params.userId
    if (!userId) return res.status(400).send({ status: false, message: 'Please provide userId' })
    if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'Please provide valid userId' })
    //checking if the cart exist with this userId or not
    let userCheck = await userModel.findById(userId)
    if (!userCheck) return res.status(404).send({ status: false, message: "no user found" })
    if (req.tokenId != userId) return res.status(403).send({ status: false, message: "you are unauthorized" })

    let findCart = await cartModel.findOne({ userId: userId }).populate('items.productId').select({ __v: 0 });
    if (!findCart) return res.status(404).send({ status: false, message: `No cart found with this "${userId}" userId` });

    res.status(200).send({ status: true, message: "Cart Details", data: findCart })

  } catch (err) {
    return res.status(500).send({ status: false, message: err.message });
  }
};


const deleteCart = async function (req, res) {
  try {
    let userId = req.params.userId;

    //--------------------------- ---------------------Validation Starts-------------------------------------//
    // validating userid from params
    if (!isValid(userId)) {
      return res.status(400).send({ status: false, message: "Invalid request parameters. userId is required" });
    }
    if (!isValidObjectId(userId)) {
      return res.status(400).send({ status: false, message: "Invalid request parameters. userId is not valid" });
    }

    let Userdata = await userModel.findOne({ _id: userId })
    if (!Userdata) {
      return res.status(404).send({ status: false, msg: "No such user exists with this userID" });
    }
    if (req.tokenId != userId) return res.status(403).send({ status: false, message: "you are unauthorized" })


    let usercart = await cartModel.findOne({ userId: userId })
    if (!usercart) {
      return res.status(404).send({ status: false, msg: "there is No such cart of this user" });
    }
    let updatedUserCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
    return res.status(204).send({ status: true, message: " cart deleted successfully" })
  } catch (err) {
    console.log(err)
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createCart, updateCart, getCart, deleteCart };