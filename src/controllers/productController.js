const mongoose = require("mongoose")
const productModel = require("../Model/productModel")
const aws = require("aws-sdk")

//-----------------------------------[validation]-----------------------------------
const isValidRequestBody = function (request) {
    return Object.keys(request).length > 0;
}
const isValid = function (value) {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "string") return true;
}
const isValidString = (String) => {
    return /\d/.test(String)
}

const isValidPrice = (price) => {
    return /^[1-9]\d{0,7}(?:\.\d{1,2})?$/.test(price)
}
const isValidSize = (sizes) => {
    return ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizes);
}
const isValidObjectId = function (ObjectId) {
    return mongoose.Types.ObjectId.isValid(ObjectId);
}
//-----------------------[aws]---------------------------
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

//----------------------------------[regex]--------------------------------------
const titleRegex = /^[a-zA-Z ]{2,45}$/;
//-------------------------------[ADD PRODUCT]-----------------------------------
const addproduct = async (req, res) => {
    try {
        let data = req.body
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data
        
        if(!isValidRequestBody(data))  return res.status(400).send({ status: false, message: "Invalid request parameter, please provide user Details" })
      
        if (!isValid(title)) return res.status(400).send({ status: false, message: "Title is required." });
        if (!titleRegex.test(title))return res.status(400).send({status: false,message: " Please provide valid title including characters only."});

        //checking for duplicate title
        let checkTitle = await productModel.findOne({ title: data.title });
        if (checkTitle) return res.status(400).send({ status: false, message: "Title already exist" });

        if (!isValid(description) && isValidString(description)) return res.status(400).send({ status: false, message: "description is required." });

        if (!isValidString(price) && !isValidPrice(price)) return res.status(400).send({ status: false, message: "price is required." });

        if (!isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId is required." });
        if (!(/INR/.test(currencyId))) return res.status(400).send({ status: false, message: "Currency Id of product should be in uppercase 'INR' format" });
        //currencyFormat
        if (!isValid(currencyFormat)) return res.status(400).send({ status: false, message: "currencyFormat is required." });
        if (!(/₹/.test(currencyFormat))) return res.status(400).send({ status: false, message: "Currency format/symbol of product should be in '₹' " });
     
         //checking for style in data 
        if (style) {
           
            if (!isValid(style) && isValidString(style)) return res.status(400).send({ status: false, message: "Style should be valid an does not contain numbers" });
            if (!titleRegex.test(style))return res.status(400).send({status: false,message: " Please provide valid style including characters only."});

        }
        // check availableSizes
        if (!isValid(availableSizes)) {
            return res.status(400).send({ status: false, message: "Available Size is required" })
        }

        // if (availableSizes) {
        //     console.log(availableSizes)
        //    // let sizes = availableSizes.split(",").map(x => x.trim())
        //     //sizes.forEach((size) => {
        //         let size = ["S", "XS", "M", "X", "L", "XXL", "XL"]
        //         let check = size.includes(availableSizes) 
        //         console.log(check)
        //         if(!check)  return res.status(400).send({ status: false, msg: `Available sizes must be among ${["S", "XS", "M", "X", "L", "XXL", "XL"]}` })


        //     }
        


        //checking for installments in data
        if (installments) {
            if (!isValidString(installments)) return res.status(400).send({ status: false, message: "Installments should be in numbers" });
            if (!isValidPrice(installments)) return res.status(400).send({ status: false, message: "Installments should be valid" });
        }

        // check isFreeShipping
        if (isFreeShipping) {
            isFreeShipping = isFreeShipping.toLowerCase();
            if (isFreeShipping == 'true' || isFreeShipping == 'false') {
                //convert from string to boolean
                isFreeShipping = JSON.parse(isFreeShipping);
            } else {
                return res.status(400).send({ status: false, message: "Enter a valid value for isFreeShipping" })
            }
            if ((typeof isFreeShipping != "boolean")) { return res.status(400).send({ status: false, message: "isFreeShipping must be a boolean value" }); }
        }
        const newProductData = {
            title,
            description,
            price,
            currencyId,
            currencyFormat: currencyFormat,
            isFreeShipping,
            style,
            availableSizes: availableSizes,
            installments,

        };
        let files = req.files
        if (files && files.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            let uploadedFileURL = await uploadFile(files[0])
            newProductData.productImage = uploadedFileURL
        }
        // console.log(availableSizes.length);
        console.log(newProductData)


        let created = await productModel.create(newProductData)
        res.status(201).send({ status: true, message: 'Product Created Successfully', data: created })
    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}

const getProductsById = async (req, res) => {
    try {
        let productId = req.params.productId;

        //checking is product id is valid or not
        if (!isValidObjectId(productId)) {
            return res.status(400).send({ status: false, message: 'Please provide valid productId' })
        }

        //getting the product by it's ID
        const product = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!product) return res.status(404).send({ status: false, message: "No product found" })

        return res.status(200).send({ status: true, message: 'Success', data: product })
    } catch (err) {
        res.status(500).send({ status: false, error: err.message })
    }
}


module.exports = { addproduct, getProductsById }
