const orderModel = require("../Model/orderModel")
const userModel = require("../Model/userModel");
const cartModel = require("../Model/cartModel");
const mongoose= require("mongoose")

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId);
}


const createOrder = async function (req, res) {
    try {
        let userId = req.params.userId.trim()
        let data = req.body
        let {cartId,cancellable} = data
        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'Please provide valid userId' })

        let userCheck = await userModel.findOne({ _id: userId })
        if (!userCheck) {
            return res.status(404).send({ status: false, message: "user id doesn't exist" })
        }
        if (req.tokenId != userId) return res.status(403).send({ status: false, message: "you are unauthorized" })

        if(!cartId) {
            return res.status(400).send({status:false,message:"please provide cartId"})
        }
        if (!isValidObjectId(cartId)) return res.status(400).send({ status: false, message: 'Please provide valid cartId' })

        let cartCheck = await cartModel.findOne({ _id: cartId, userId: userId })
        if (!cartCheck) {
            return res.status(404).send({ status: false, message: "no cart is created for this user " })
        }
        if (cartCheck.items.length == 0) {
            return res.status(400).send({ status: false, message: "cart is empty" })
        }
        let order = {}
        order.userId = userId
        order.items = []
        let itemLength = cartCheck.items.length
        let totalQuantity = 0
        for (let i = 0; i < itemLength; i++) {
            //need to ask wheather we have to check the productId is present or not
            if (cartCheck.items[i].quantity >= 1) {
                order.items.push(cartCheck.items[i])
                totalQuantity += cartCheck.items[i].quantity

            }
        }
        order.totalPrice = cartCheck.totalPrice
        order.totalItems = cartCheck.totalItems
        order.totalQuantity = totalQuantity
        if (cancellable) {
            if (typeof req.body.cancellable != "boolean") {
                return res.status(400).send({ status: false, message: "cancellable should be boolean" })
            }
        }
        order.cancellable = cancellable

        let sts = ["pending"]
        if (req.body.status) {
            if (!sts.includes(req.body.status)) {
                return res.status(400).send({ status: false, message: "status should be pending" })
            }
            order.status = req.body.status
        }
        // if (req.body.isDeleted) {
        //     if (typeof req.body.isDeleted != Boolean) {
        //         return res.status(400).send({ status: false, message: "isDeleted should be  in Boolean format" })
        //     }
        //     if (req.body.isDeleted == true) {
        //         if (typeof req.body.deletedAt != Date) {
        //             return res.status(400).send({ status: false, message: "deletedAt should be in Date format " })
        //         }
        //         cart.deletedAt=deletedAt
        //     }
        //     cart.isDeleted=isDeleted
        // }
        let filter={}
           filter.items=[]
           filter.totalItems=0
           filter.totalPrice=0
        let cartUpdated=await cartModel .findOneAndUpdate({_id:cartId},filter,{new:true})

        let oredrCreate = await orderModel.create(order)
        res.status(201).send({ status: true, message: "Success", data: oredrCreate })


    } catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message })
    }
}

const updateOrder = async function (req, res) {
    try {
        let userId = req.params.userId.trim()
        let orderId = req.body.orderId.trim()
        let statusbody = req.body.status.trim()

        if (!isValidObjectId(userId)) return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        let userCheck = await userModel.findOne({ _id: userId })
        if (!userCheck) {
            return res.status(404).send({ status: false, message: "user id doesn't exist" })
        }
        if (req.tokenId != userId) return res.status(403).send({ status: false, message: "you are unauthorized" })

        if(!orderId){
            return res.status(400).send({ststus:false,message:"provide orderId"})
        }
        if (!isValidObjectId(orderId)) return res.status(400).send({ status: false, message: 'Please provide valid userId' })
        let checkOrder = await orderModel.findOne({ _id: orderId })
        if (!checkOrder) {
            return res.status(404).send({ status: false, message: "order is not created " })
        }
        if (checkOrder.userId.toString() !== userId) {
            return res.status(404).send({ status: false, message: `order is not for ${userId}, you cannot order it  ` })
        }
        
        if(statusbody!="completed"&& statusbody!="cancled") return res.status(400).send({status:false,message:"statusbody should be cancled or completed"})
        
        if (statusbody) {
            if (!(['completed', 'cancled'].includes(statusbody))) {
                return res.status(400).send({ status: false, message: `Status must be among ['completed','cancled'].`, });
            }
        }

        if (checkOrder.cancellable == true) {

            if (checkOrder.status == statusbody) {
                return res.status(200).send({ status: false, message: `Order status is alreday ${statusbody}` })
            }

            if (checkOrder.status == "completed") {
                return res.status(400).send({ status: false, message: `Order alreday Completed Successfully.` })
            }
            if (checkOrder.status == "pending") {
                const updateorderStatus = await orderModel.findOneAndUpdate(
                    { _id: checkOrder._id },
                    { $set: { status: statusbody } },
                    { new: true })
                return res.status(200).send({ status: true, message: `Successfully updated the order details.`, data: updateorderStatus })
            }
            if (checkOrder.status == "cancelled") {
                return res.status(400).send({ status: false, message: `Order is already Cancelled.` })
            }
        }else if(checkOrder.cancellable == false){
            if(statusbody=="completed" && checkOrder.status=="pending"){
                const updateorderStatus = await orderModel.findOneAndUpdate(
                    { _id: checkOrder._id },
                    { $set: { status: statusbody } },
                    { new: true })
                return res.status(200).send({ status: true, message: `Successfully updated the order details.`, data: updateorderStatus })
            
            }

        }else{
            return res.status(400).send({ status: false, message: `Cannot cancel the order due to Non-cancellable policy.` })
        }
        // updateData={}

        // updateData.status=statusbody

        // if (checkOrder.cancellable == false) {
        //     if (statusbody == "cancled") {
        //         return res.status(404).send({ status: false, message: `cannot cancel the order ` })
        //     }
        // }

        // if(checkOrder="completed") return res.status(400).sand({status:false,message:"order is already completed"})
        // if(checkOrder="cancled") return res.status(400).sand({status:false,message:"order is already cancled"})
        // if (req.body.isDeleted == Boolean) {
        //    updateData.isDeleted = req.body.isDeleted
        //     if (req.body.isDeleted == true) {
        //         updateData.deletedAt = new Date.now()
        //     }

        // }


        // let updateOrder = await orderModel.findByIdAndUpdate({ _id: orderId },updateData, { new: true })
        // res.status(201).send({ status: true, message: "Success", data: updateOrder })
    }
    catch (error) {
        res.status(500).send({ status: false, message: error.message })
        console.log(error)
    }

}










module.exports = { createOrder, updateOrder }