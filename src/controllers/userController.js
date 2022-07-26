express= require("express")
const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const userModel = require("../Model/userModel");
const jwt = require("jsonwebtoken");
const { add } = require("nodemon/lib/rules");



const isValidRequestBody = function (request) {
    return Object.keys(request).length > 0;
}
const isValid =  function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if(typeof value === "string") return true;
}

const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId);
}
// const isValidPincode = (num) => {
//     return /^[0-9]{6}$/.test(num);
// }

//   const isValidAddress = (String) => {
//     return /\d/.test(String)
//   }

// Register
const registerUser = async function (req, res) {
    try {

        const files = req.files //Getting user profileImage  
        const requestBody = req.body // Getting other details of user

       // Validation of Request Body
        if (!isValidRequestBody(requestBody)) {
            return res.status(400).send({ status: false, message: "Invalid request parameter, please provide user Details" })
        }

        // Extract body by destructuring
        let { fname, lname, email, phone, password, address } = requestBody;

        //--------------------------------------Validation Starts----------------------------------//

        if (!fname) return res.status(400).send({ status: false, message: "fname is required" })
        if (!isValid(fname)) return res.status(400).send({ status: false, message: "fname must be in string & not empty" })

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
 
        if (!address) return res.status(400).send({ status: false, message: "Please include address" });
        if (!isValidRequestBody(address)) return res.status(400).send({ status: false, message: "address is required" })

        // billing address validation
        let { shipping, billing } = address;
        console.log(address.billing)
        if (!billing) { return res.status(400).send({ status: false, message: "Please include billing address" }) };
        if (!isValidRequestBody(address.billing)) return res.status(400).send({ status: false, message: "billing address is required" })
        let { city, street, pincode } = shipping;
        if (!street) { return res.status(400).send({ status: false, message: "Please include billing street" }) };
        if (!isValid(billing.street)) {
            return res.status(400).send({ status: false, message: "street is required in billing address!" });
        }

        if (!city) { return res.status(400).send({ status: false, message: "Please include billing city" }) };
        if (!isValid(billing.city)) {
            return res.status(400).send({ status: false, message: "city is required in billing address!" });
        }

        if (!(pincode)) return res.status(400).send({ status: false, message: "please provide billing address!" });
        if (!(/^[1-9][0-9]{5}$/.test(address.billing.pincode))) return res.status(400).send({ status: false, message: "provide a valid pincode." })


        if (!address.shipping) { return res.status(400).send({ status: false, message: "Please include shipping address" }) };
        if (!isValidRequestBody(address.shipping)) return res.status(400).send({ status: false, message: "shipping address is required" })

        if (!address.shipping.street) { return res.status(400).send({ status: false, message: "Please include shipping street" }) };
        if (!isValid(shipping.street)) {
            return res.status(400).send({ status: false, message: "street is required in shipping address!" });
        }

        if (!address.shipping.city) { return res.status(400).send({ status: false, message: "Please include shipping city" }) };
        if (!isValid(shipping.city)) {
            return res.status(400).send({ status: false, message: "city is required in shipping address!" });
        }

        if (!(address.shipping.pincode)) return res.status(400).send({ status: false, message: "please provide shipp pincode!" });
        if (!(/^[1-9][0-9]{5}$/.test(address.shipping.pincode))) return res.status(400).send({ status: false, message: "provide a valid pincode." })

        //if request files array is empty
        // if (!(files && files.length > 0)) {
        //     return res.status(400).send({ status: false, message: "Profile image is required" });
        // }

        //--------------------------------------Validation Ends----------------------------------//

        // requestBody.profileImage = await uploadFile(files[0]);  //profileImage uploaded to AWS S3 Bucket

        const createdUser = await userModel.create(requestBody)
        res.status(201).send({ status: true, message: 'User created successfully', data: createdUser })


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

        const user = await userModel.findOne({ email: email, password: password });
        if (!user) return res.status(401).send({ status: false, message: "Invalid Credential" })

      //  let actualPassWord = await bcrypt.compare(password, user.password);
    
        //if(!actualPassWord) return res.status(400).send({ status: false, message: "Incorrect password" })

        let token = jwt.sign({ userId: user._id.toString(), iat: Math.floor(Date.now() / 1000) },
         "Project5-productManagement", 
        { expiresIn: '1h' });
         res.setHeader("Authorization", token);

        res.status(200).send({ status: true, message: "User login successful", data: {userId:user._id,token:token} });

    }
    catch (err){
        res.status(500).send({ status: false, msg: err.message });
    }
}


//------------------------------------------[Get Profile]---------------------------------------------------------
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


//----------------------------------------[UPDATE PROFILE]----------------------------------------------
const updatedProfile = async (req, res) => {
    try {
      let data = req.body;
      let userId = req.params.userId;
      let files = req.files;
      let userIdfromtoken = req.tokenId
  
      console.log("hello")
  
      // let userProfile=await userModel.findById(userId)
      if (!isValid(userId)) {
        return res.status(400).send({ status: false, message: "userId is not given" });
      }
      if (!mongoose.isValidObjectId(userId)) {
        return res.status(400).send({ status: false, message: "userId is Invalid" });
      }
  
      const findUserId = await userModel.findById(userId);
      if (!findUserId)
        return res.status(403).send({ status: false, message: "NO DATA FOUND" });
      if(findUserId._id.toString() != userIdfromtoken){
        return res.status(403).send({ status: false, message: "YOU ARE NOT AUTHORIZED" });
      }


        // check request body is valid
      if (!isValidRequestBody(data)) {
        return res.status(400).send({ status: false, msg: "Enter a valid details" });
      }
  
      let { fname, lname, email, password, phone, address } =data;
      let updateData = {};
  
      if (fname) {
        if (!isValid(fname)) {return res.status(400).send({ status: false, message: "fname is missing." });}
       // if (!validString(fname)) {return res.status(400).send({ status: false, msg: "fname should be string" });}
        updateData.fname = fname;}
      
      if (lname) {
        if (!isValid(lname)) {return res.status(400).send({ status: false, message: "lname is missing." });}
      //  if (!validString(lname)) {return res.status(400).send({ status: false, msg: "lname should be string" });}
  
        updateData.lname = lname;
      }
        if (email){
        email = email.toLowerCase()
        if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) return res.status(400).send({ status: false, message: "enter valid email" })
        let emailCheck = await userModel.findOne({ email: email })
        if (emailCheck) return res.status(409).send({ status: false, msg: "email already used" })
        // if (!isValid(email)) return res.status(400).send({ status: false, message: "email must be in string & not empty"})
        updateData.email = email;
    }

      if(phone){
        if (!isValid(phone)) return res.status(400).send({ status: false, message: "Enter a valid phone number" })
        if (!(/^[6-9]{1}[0-9]{9}$/im.test(phone))) return res.status(400).send({ status: false, message: "phone No is invalid. +91 is not required" })
        let checkMobile = await userModel.findOne({ phone })
        if (checkMobile) return res.status(409).send({ status: false, message: "Phone Number is already used" })
        updateData.phone = phone;}
  
      
      
        if (password) { 
        if (!isValid(password)) { return res.status(400).send({ status: false, message: "password is invalid" }); }
        if ((password).includes(" ")) { { return res.status(400).send({ status: false, message: "Please remove any empty spaces in password" }); } }
        if (!((password.length >= 8) && (password.length < 15))) { return res.status(400).send({ status: false, message: "Password should be in 8-15 character" }) }
         data.password = await bcrypt.hash(data.password, 10);
        }
      
  
  
    //   if (data.profileImage) {
    //       if (typeof data.profileImage === "string") {
    //           return res.status(400).send({ Status: false, message: "Please upload the image" })
    //       }
    //   }
      if (files && files.length > 0) {
  
          let uploadedFileURL = await uploadFile(files[0])
          data.profileImage = uploadedFileURL
          updateData.profileImage = data.profileImage
      }
      if (address) {
      if (!isValidRequestBody(address)) return res.status(400).send({ status: false, message: "address is required" })
      updateData.address = data.address
      }

      // billing address validation
      let { shipping, billing } = address;
      console.log(address.billing)
      shipping= JSON.parse(address.shipping)

      if (address.shipping) { 
      if (!isValidRequestBody(address.shipping)) return res.status(400).send({ status: false, message: "billing address is required" })}
      //let { city, street, pincode } = shipping;

      if (address.shipping.street) {  
      if (!isValid(address.shipping.street)) {
        console.log()
          return res.status(400).send({ status: false, message: "street is required in billing address!" });}
          updateData.address.shipping.street = shipping.street;
      }

      if (address.shipping.city) { 
      if (!isValid(address.shipping.city)) {
          return res.status(400).send({ status: false, message: "city is required in billing address!" });}
          updateData.address.shipping.city = shipping.city;}

      if (address.shipping.pincode) {
      if (!(/^[1-9][0-9]{5}$/.test(address.shipping.pincode))) return res.status(400).send({ status: false, message: "provide a valid pincode." })
      updateData.address.shipping.pincode = shipping.pincode;}

      if (address.billing) { 
      if (!isValidRequestBody(address.billing)) return res.status(400).send({ status: false, message: "shipping address is required" })}
        

      if (address.billing.street) { 
      if (!isValid(billing.street)) {
          return res.status(400).send({ status: false, message: "street is required in shipping address!" }); }
          updateData.address.billing.street = billing.street;}

      if (address.billing.city) { 
      if (!isValid(billing.city)) {
          return res.status(400).send({ status: false, message: "city is required in shipping address!" });}
          updateData.address.billing.city = billing.city;}


      if ((address.billing.pincode)){
      if (!(/^[1-9][0-9]{5}$/.test(address.billing.pincode))) return res.status(400).send({ status: false, message: "provide a valid pincode." })
      updateData.address.billing.pincode = billing.pincode;}
    
      
      const updateUser=await userModel.findByIdAndUpdate(userId,updateData,{new:true})
      res.status(200).send({status:true,msg:"User profile updated",data:updateUser})
  
      
    } catch (err) {
        console.log(err)
        res.status(500).send({msg:err.message})
    }
  };
  
module.exports = { userLogin, getProfile ,registerUser,updatedProfile}

