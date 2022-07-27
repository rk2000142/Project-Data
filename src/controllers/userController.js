const mongoose = require("mongoose")
const userModel = require("../Model/userModel");
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const aws = require("aws-sdk")


aws.config.update({
    accessKeyId: "AKIAY3L35MCRVFM24Q7U",
    secretAccessKey: "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",
    region: "ap-south-1"
})

let uploadFile = async (file) => {
    return new Promise(function (resolve, reject) {
        // this function will upload file to aws and return the link
        let s3 = new aws.S3({ apiVersion: '2006-03-01' }); // we will be using the s3 service of aws

        var uploadParams = {
            ACL: "public-read",
            Bucket: "classroom-training-bucket",  //HERE
            Key: "group23/" + file.originalname, //HERE 
            Body: file.buffer
        }


        s3.upload(uploadParams, function (err, data) {
            if (err) {
                return reject({ "error": err })
            }
            // console.log(data)
            // console.log("file uploaded succesfully")
            return resolve(data.Location)
        })

    })
}



const isValidRequestBody = function (request) {
    return Object.keys(request).length > 0;
}
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "string") return true;
}
const nameRegex = /^[a-zA-Z ]{2,45}$/;



// Register
const registerUser = async function (req, res) {
    try {
        const requestBody = req.body // Getting other details of user

        // Validation of Request Body
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide user Details" })
        }

        // Extract body by destructuring
        let { fname, lname, email, phone, password, address } = requestBody;

        //--------------------------------------Validation Starts----------------------------------//

        if (!fname) return res.status(400).send({ status: false, message: "fname is required" })
        if (!isValid(fname)&& !(nameRegex.test(fname))) return res.status(400).send({ status: false, message: "fname must be in string & not empty" })

        if (!lname) return res.status(400).send({ status: false, message: "lname is required" })
        if (!isValid(lname)) return res.status(400).send({ status: false, message: "lname must be in string & not empty" })

        if (!email) return res.status(400).send({ status: false, message: "email is required" })
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return res.status(400).send({ status: false, message: "enter valid email" })
        let emailCheck = await userModel.findOne({ email: email })
        if (emailCheck) return res.status(409).send({ status: false, msg: "email already used" })
        // if (!isValid(email)) return res.status(400).send({ status: false, message: "email must be in string & not empty"})

        if (!isValid(phone)) return res.status(400).send({ status: false, message: "phone is required" })
        if (!(/^[6-9]{1}[0-9]{9}$/im.test(phone))) return res.status(400).send({ status: false, message: "phone No is invalid. +91 is not required" })
        let checkMobile = await userModel.findOne({ phone })
        if (checkMobile) return res.status(409).send({ status: false, message: "Phone Number is already used" })

        if (!password) { return res.status(400).send({ status: false, message: "Please include a password" }) };
        if (!isValid(password)) { return res.status(400).send({ status: false, message: "password is invalid" }); }
        if ((password).includes(" ")) { { return res.status(400).send({ status: false, message: "Please remove any empty spaces in password" }); } }
        if (!((password.length >= 8) && (password.length < 15))) { return res.status(400).send({ status: false, message: "Password should be in 8-15 character" }) }

        let protectedPassword = await bcrypt.hash(password, 10)
        requestBody.password = protectedPassword

        //if (!profileImage) return res.status(400).send({ status: false, message: "profileImage is required" })

        // address validation
        if (!address) return res.status(400).send({ status: false, message: "Please include address" });
        if (typeof address === "string")  {address = JSON.parse(address)}
        if (!isValidRequestBody(address)) return res.status(400).send({ status: false, message: "address is required" })
        //console.log(addresss)

        if (!addresss.billing) { return res.status(400).send({ status: false, message: "Please include billing address" }) };
        if (!isValidRequestBody(addresss.billing)) return res.status(400).send({ status: false, message: "billing address is required" })

        if (!addresss.billing.street) { return res.status(400).send({ status: false, message: "Please include billing street" }) };
        if (!isValid(addresss.billing.street)) {
            return res.status(400).send({ status: false, message: "street is required in billing address!" });
        }

        if (!addresss.billing.city) { return res.status(400).send({ status: false, message: "Please include billing city" }) };
        if (!isValid(addresss.billing.city)) {
            return res.status(400).send({ status: false, message: "city is required in billing address!" });
        }

        if (!(addresss.billing.pincode)) return res.status(400).send({ status: false, message: "please provide billing address!" });
        if (!(/^[1-9][0-9]{5}$/.test(addresss.billing.pincode))) return res.status(400).send({ status: false, message: "provide a valid pincode." })


        if (!addresss.shipping) { return res.status(400).send({ status: false, message: "Please include shipping address" }) };
        if (!isValidRequestBody(addresss.shipping)) return res.status(400).send({ status: false, message: "shipping address is required" })

        if (!addresss.shipping.street) { return res.status(400).send({ status: false, message: "Please include shipping street" }) };
        if (!isValid(addresss.shipping.street)) {
            return res.status(400).send({ status: false, message: "street is required in shipping address!" });
        }

        if (!addresss.shipping.city) { return res.status(400).send({ status: false, message: "Please include shipping city" }) };
        if (!isValid(addresss.shipping.city)) {
            return res.status(400).send({ status: false, message: "city is required in shipping address!" });
        }

        if (!(addresss.shipping.pincode)) return res.status(400).send({ status: false, message: "please provide shipping address!" });
        if (!(/^[1-9][0-9]{5}$/.test(addresss.shipping.pincode))) return res.status(400).send({ status: false, message: "provide a valid pincode." })

        requestBody.address = addresss
        //--------------------------------------Validation Ends----------------------------------//



        let files = req.files
        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await uploadFile(files[0])
            requestBody.profileImage = uploadedFileURL
            let created = await userModel.create(requestBody)
            res.status(201).send({ status: true, message: 'User Created Successfully', data: created })
        }
        else {
            res.status(400).send({status:falsee, msg: "No file found" })
        }


    } catch (err) {
        console.log(err)
        res.status(500).send({ status: false, msg: err.message })
    }

}


//------------------------------------------[user Login]--------------------------------------------------------------------
const userLogin = async function (req, res) {
    try {
        const loginData = req.body
        const { email, password } = loginData
        if (!isValidRequestBody(loginData)) {
            return res.status(400).send({ status: false, message: "Invalid Request, please enter emailId and password" })
        }
        if (!isValid(email)) return res.status(400).send({ status: false, message: "Email Id is required" })
        if (!isValid(password)) return res.status(400).send({ status: false, message: "password is required" })

        const user = await userModel.findOne({ email: email });
        if (!user) return res.status(401).send({ status: false, message: "Invalid Credential" })
        bcrypt.compare(password, user.password, function (err, result) {
            if (err) return res.status(401).send({ status: false, message: "password is wrong" })
        })

        //  let actualPassWord = await bcrypt.compare(password, user.password);

        //if(!actualPassWord) return res.status(400).send({ status: false, message: "Incorrect password" })

        let token = jwt.sign({ userId: user._id.toString(), iat: Math.floor(Date.now() / 1000) },
            "Project5-productManagement",
            { expiresIn: '24h' });
        res.setHeader("Authorization", token);

        res.status(200).send({ status: true, message: "User login successful", data: { userId: user._id, token: token } });

    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message });
    }
}


//------------------------------------------[Get Profile]---------------------------------------------------------
const getProfile = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!mongoose.isValidObjectId(userId)) return res.status(400).send({ status: false, message: "invalid userId" })
        if (req.tokenId != userId) return res.status(403).send({ status: false, message: "unauthorized" })

        let profile = await userModel.findById(userId)
        if (!profile) return res.status(404).send({ status: false, message: "no such user" })
        res.status(200).send({ status: true, message: 'User profile details', data: profile })

    } catch (error) {
        res.status(500).send({ status: false, msg: err.message })
    }
}


//----------------------------------------[UPDATE PROFILE]----------------------------------------------
const updatedProfile = async (req, res) => {
    try {
        let data = req.body;
        let userId = req.params.userId;
        let files = req.files;
        let userIdfromtoken = req.tokenId

        //console.log("hello")

        // let userProfile=await userModel.findById(userId)
        if (!isValid(userId)) {
            return res.status(400).send({ status: false, message: "userId is not given" });
        }
        if (!mongoose.isValidObjectId(userId)) {
            return res.status(400).send({ status: false, message: "userId is Invalid" });
        }

        //const findUserId = await userModel.findById(userId);
        //if (!findUserId)
        //return res.status(403).send({ status: false, message: "NO DATA FOUND" });
        if (userId != userIdfromtoken) {
            return res.status(403).send({ status: false, message: "YOU ARE NOT AUTHORIZED" });
        }


        // check request body is valid
        if (!(isValidRequestBody(data) || files)) {
            return res.status(400).send({ status: false, msg: "Enter a valid details" });
        }

        let { fname, lname, email, password, phone, address } = data;
        let updateData = {};

        if (fname) {
            if (!isValid(fname)) { return res.status(400).send({ status: false, message: "fname is missing." }); }
            // if (!validString(fname)) {return res.status(400).send({ status: false, msg: "fname should be string" });}
            updateData.fname = fname;
        }

        if (lname) {
            if (!isValid(lname)) { return res.status(400).send({ status: false, message: "lname is missing." }); }
            //  if (!validString(lname)) {return res.status(400).send({ status: false, msg: "lname should be string" });}
            updateData.lname = lname;
        }
        if (email) {
            email = email.toLowerCase()
            if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return res.status(400).send({ status: false, message: "enter valid email" })
            let emailCheck = await userModel.findOne({ email: email })
            if (emailCheck) return res.status(409).send({ status: false, msg: "email already used" })
            // if (!isValid(email)) return res.status(400).send({ status: false, message: "email must be in string & not empty"})
            updateData.email = email;
        }

        if (phone) {
            if (!isValid(phone)) return res.status(400).send({ status: false, message: "Enter a valid phone number" })
            if (!(/^[6-9]{1}[0-9]{9}$/im.test(phone))) return res.status(400).send({ status: false, message: "phone No is invalid. +91 is not required" })
            let checkMobile = await userModel.findOne({ phone })
            if (checkMobile) return res.status(409).send({ status: false, message: "Phone Number is already used" })
            updateData.phone = phone;
        }



        if (password) {
            if (!isValid(password)) { return res.status(400).send({ status: false, message: "password is invalid" }); }
            if ((password).includes(" ")) { { return res.status(400).send({ status: false, message: "Please remove any empty spaces in password" }); } }
            if (!((password.length >= 8) && (password.length < 15))) { return res.status(400).send({ status: false, message: "Password should be in 8-15 character" }) }
            updateData.password = await bcrypt.hash(password, 10);

        }



        if (data.profileImage) {
            if (typeof data.profileImage === "string") {
                return res.status(400).send({ Status: false, message: "Please upload the image" })
            }
        }
        if (files && files.length > 0) {

            let uploadedFileURL = await uploadFile(files[0])
            //data.profileImage = uploadedFileURL
            updateData.profileImage = uploadedFileURL
        }
        if (address) {
            if (typeof address === "string") { address = JSON.parse(address) }
            if (!isValidRequestBody(address)) return res.status(400).send({ status: false, message: "address is required" })


            if (address.shipping) {
                if (!isValidRequestBody(address.shipping)) return res.status(400).send({ status: false, message: "billing address is required" })
                if (address.shipping.street) {
                    if (!isValid(address.shipping.street)) {
                        return res.status(400).send({ status: false, message: "street is required in billing address!" });
                    }
                    updateData['address.shipping.street'] = address.shipping.street;
                }

                if (address.shipping.city) {
                    if (!isValid(address.shipping.city)) return res.status(400).send({ status: false, message: "city is required in billing address!" });
                    updateData['address.shipping.city'] = address.shipping.city;
                }

                if (address.shipping.pincode) {
                    let pinCode = parseInt(address.shipping.pincode)
                    if (!(/^[1-9][0-9]{5}$/.test(pinCode))) return res.status(400).send({ status: false, message: "provide a valid pincode." })
                    updateData['address.shipping.pincode'] = pinCode;
                }
            }

            if (address.billing) {
                if (!isValidRequestBody(address.billing)) return res.status(400).send({ status: false, message: "shipping address is required" })


                if (address.billing.street) {
                    if (!isValid(address.billing.street)) {
                        return res.status(400).send({ status: false, message: "street is required in shipping address!" });
                    }
                    updateData['address.billing.street'] = address.billing.street;
                }

                if (address.billing.city) {
                    if (!isValid(address.billing.city)) {
                        return res.status(400).send({ status: false, message: "city is required in shipping address!" });
                    }
                    updateData['address.billing.city'] = address.billing.city;
                }


                if ((address.billing.pincode)) {
                    if (!(/^[1-9][0-9]{5}$/.test(address.billing.pincode))) return res.status(400).send({ status: false, message: "provide a valid pincode." })
                    updateData['address.billing.pincode'] = address.billing.pincode;
                }
            }
        }


        const updateUser = await userModel.findByIdAndUpdate(userId, updateData, { new: true })
        res.status(200).send({ status: true, msg: "User profile updated", data: updateUser })


    } catch (err) {
        console.log(err)
        res.status(500).send({ msg: err.message })
    }
};

module.exports = { userLogin, getProfile, registerUser, updatedProfile }

