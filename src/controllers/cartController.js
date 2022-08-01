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
      data.totalPrice = data.totalPrice+ productCheck.price * data.items[i].quantity
    }

    let cartCheck = await cartModel.findOne({ userId: userId })
    if (cartCheck) {
      const updateData = await cartModel.findOneAndUpdate(
        {userId:userId},
        {$inc:{totalPrice:data.totalPrice,totalItems:data.totalItems},$push:{items:data.items}},
        {new:true})
        return res.status(200).send({status:false,message:"success", data:updateData})

    }else{
      const createData = await cartModel.create(data)
      return res.status(201).send({ status: true, message: "Success", data: createData })
    }
  } catch (err) {
    console.log(err)
    return res.status(500).send({ status: false, message: err.message });
  }
};



const updateCart = async function (req, res) {
  try {
    let data=req.body
    let userId=req.params.userId

    if(!isValidRequestBody(data)){return res.status(400).send({status:false, msg:"Product details must need to update"}) }
    if(!mongoose.isValidObjectId(userId)){ return res.status(400).send({status:false, msg:"need userId"})}
    const isPresentUser= await userModel.findById({_id:userId})
    if(!isPresentUser){ return res.status(404).send({status:false, msg:"User not found"})}

    const {cartId, productId, removeProduct}=data

    if(!isValid(cartId)){return res.status(400).send({status:false, msg:"CardId is required"})}

    if(!isValid(productId)){return res.status(400).send({status:false, msg:"Product Id is requried"})}

    if(!isValid(removeProduct)){return res.status(400).send({status:false, msg:"Remove product is requried"})}

   //  if(removeProduct )

    if(!mongoose.isValidObjectId(productId)){return res.status(400).send({status:false, msg:"Product Id is invalid"}) }

    const isPresentProductId= await productModel.findById(productId)
    if(!isPresentProductId){return res.status(404).send({status:false, msg:"Product Id does not exist"}) }

    if(!mongoose.isValidObjectId(cartId)){return res.status(400).send({status:false, msg:"Cart Id is invalid"})}

    if (!(removeProduct == 0 || removeProduct == 1)) {
     return res.status(400).send({ status: false, msg: "removeProduct value should be either 0 or 1" })
   }

    const isPresentCartId=await cartModel.findOne({_id:cartId, userId:userId})
    if(!isPresentCartId){return res.status(404).send({status:false, msg:"No such cart exist"})}

    if (!(removeProduct == 0 || removeProduct == 1)) {
       return res.status(400).send({ status: false, msg: "removeProduct value should be either 0 or 1" })
     }

     const productDetails = await productModel.findOne({ _id: productId, isDeleted: false })
     if (!productDetails) {
       return res.status(404).send({ status: false, msg: "product not exist or deleted" })
     }
    

    const cart=isPresentCartId.items
    

    for(let i=0;i<cart.length;i++){
        if(cart[i].productId==productId){
            let changePrice=cart[i].quantity * isPresentProductId.price

            if(removeProduct==0){
                const productRemove= await cartModel.findOneAndUpdate({_id:cartId}, {$pull:{items:{productId:productId}},
                   totalPrice: isPresentCartId.totalPrice - changePrice, totalItems:isPresentCartId.totalItems-1},{new:true})
              return  res.status(200).send({status:true, msg:"Remove product Successfully",data:productRemove})
            }

            if(removeProduct==1){
                if(cart[i].quantity==1 && removeProduct==1 ){
                    const priceUpdate=await cartModel.findOneAndUpdate({_id:cartId},{$pull:{items:{productId}},
                      totalPrice:isPresentCartId.totalPrice-changePrice, totalItems:isPresentCartId.totalItems-1},{new:true})
                return res.status(200).send({status:true,msg:"Remove product and price update successfully",data:priceUpdate})
                }
                cart[i].quantity=cart[i].quantity-1;
                const cartUpdated= await cartModel.findByIdAndUpdate({_id:cartId},
                  {items:cart,totalPrice:isPresentCartId.totalPrice -isPresentProductId.price},{new:true})
              return  res.status(200).send({status:true,msg:"One item remove successfully",data:cartUpdated})
            }
        }
    }

} catch (err) {
    console.log(err)
    res.status(500).send({ status: false, message: err.message });
}
}
const getCart = async function (req, res) {
  try {
    let userId = req.params.userId;
  
      //checking if the cart exist with this userId or not
      if(!isValidObjectId(userId)){
          return res.status(400).send({status:false,msg:"please provide valid userId"})
      }
      let findCart = await cartModel.findOne({ userId:userId }).populate('items.productId').select({__v:0});
      if(!findCart) return res.status(404).send({ status: false, message: `No cart found with this "${userId}" userId` });
  
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
      
        let usercart = await cartModel.findOne({ userId: userId })
        if (!usercart) {
            return res.status(404).send({ status: false, msg: "No such user found. Please register and try again" });
        }
        let updatedUserCart = await cartModel.findOneAndUpdate({ userId: userId }, { items: [], totalPrice: 0, totalItems: 0 }, { new: true })
        return res.status(200).send({ status: true , message: " cart deleted successfully"})
  } catch (err) {
    console.log(err)
    return res.status(500).send({ status: false, message: err.message });
  }
};

module.exports = { createCart, updateCart, getCart, deleteCart };
