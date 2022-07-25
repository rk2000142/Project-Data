const mongoose = require("mongoose")
const userModel = require("../Model/userModel")
const userModel = require("../Model/userModel");
const jwt = require("jsonwebtoken");



const isValidRequestBody = function (request) {
    return Object.keys(request).length > 0;
}
const isValid =  function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    return true;
}


const userLogin = async function (req, res) {
    try {
        const loginData = req.body
        const { email, password } = loginData
        if (isValidRequestBody(loginData)) {
            return res.status(400).send({ status: false, message: "Invalid Request, please enter emailId and password" })
        }
        if (isValid(email)) return res.status(400).send({ status: false, message: "Email Id is required" })
        if (isValid(password)) return res.status(400).send({ status: false, message: "password is required" })

        const user = await userModel.findOne({ email: email, password: password });
        if (!user) return res.status(401).send({ status: false, message: "Invalid Credential" })

        let token = jwt.sign({ userId: user._id.toString(), iat: Math.floor(Date.now() / 1000) },
         "Project5-productManagement", 
        { expiresIn: '1h' });
         res.setHeader("Authorization", token);

        res.status(200).send({ status: true, message: "User login successful", data: {userId:user._id,token:token} });

    }
    catch {
        res.status(500).send({ status: false, msg: err.message });
    }
}



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
module.exports = { userLogin, getProfile }

