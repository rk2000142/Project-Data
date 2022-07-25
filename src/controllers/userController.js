const mongoose = require("mongoose")
const userModel = require("../Model/userModel")



const getProfile = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid userId" })
        if (req.tokenId != userId) return res.status(403).send({ status: false, message: "unauthorized" })

        profile = await userModel.findById(userId)
        if (!profile) return res.status(404).send({ status: false, message: "no such user" })
        res.status(200).send({ status: true, message: 'User profile details', data: profile })

    } catch (error) {
      res.status(500).send({ status: false, msg: err.message })
    }
}