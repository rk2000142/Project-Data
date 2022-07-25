express= require("express")




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

        if (!isValid(fname) || !isValidName(fname)) {
            return res.status(400).send({ status: false, message: "fname is required"})
        }

        // billing address validation
         if(!isValidAddress(billing)) {
            return res.status(400).send({ status: false, message: "billing address is required!" });
        }

        if (!isValid(billing.street)) {
            return res.status(400).send({ status: false, message: "street is required in billing address!" });
        }

        if (!isValid(billing.city)) {
            return res.status(400).send({ status: false, message: "city is required in billing address!" });
        }

        if (!isValidPincode(billing.pincode)) {
            return res.status(400).send({ status: false, message: "please use a valid pincode in billing address!" });
        }

        //if request files array is empty
        if (!(files && files.length > 0)) {
            return res.status(400).send({ status: false, message: "Profile image is required" });
        }

        //--------------------------------------Validation Ends----------------------------------//

        requestBody.profileImage = await uploadFile(files[0]);  //profileImage uploaded to AWS S3 Bucket

        const createdUser = await userModel.create(requestBody)
        res.status(201).send({ status: true, message: 'User created successfully', data: createdUser })
    

    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }

}