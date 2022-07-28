const mongoose = require("mongoose")
const productModel = require("../Model/productModel")
const aws = require("aws-sdk")







//-----------------------------------[validation]-----------------------------------
const isValidRequestBody = function (request) {
    return Object.keys(request).length > 0;
}
const isValid = (value) => {
    if (typeof value === "undefined" || value === null) return false;
    if (typeof value === "string" && value.trim().length === 0) return false;
    if (typeof value === "string") return true;
    // if (typeof value === "undefined" || typeof value === "null") return true;
    // if (typeof value === "string" && value.trim().length == 0) return true;
    //if (typeof value === "object" && Object.keys(value).length == 0) return true;
    //return false;
}
const isValidString = (String) => {
    return /\d/.test(String)
}

const isValidPrice = (price) => {
    return /^[1-9]\d{0,7}(?:\.\d{1,2})?$/.test(price)
}
// const isValidSize = (sizes) => {
//     return ["S", "XS", "M", "X", "L", "XXL", "XL"].includes(sizes);
// }
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
        let { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments, productImage } = data

        if (!isValidRequestBody(data)) return res.status(400).send({ status: false, message: "Invalid request parameter, please provide user Details" })

        if (!isValid(title)) return res.status(400).send({ status: false, message: "Title is required." });
        if (!titleRegex.test(title)) return res.status(400).send({ status: false, message: " Please provide valid title including characters only." });

        //checking for duplicate title
        let checkTitle = await productModel.findOne({ title: data.title });
        if (checkTitle) return res.status(400).send({ status: false, message: "Title already exist" });

        if (!description) return res.status(400).send({ status: false, message: "description is required." });
        if (!isValid(description) && isValidString(description)) return res.status(400).send({ status: false, message: "description is required." });

        if (!price) return res.status(400).send({ status: false, message: "price is required." });
        if (!isValidString(price) && !isValidPrice(price)) return res.status(400).send({ status: false, message: "price Should be in number only...!" });

        if (!isValid(currencyId)) return res.status(400).send({ status: false, message: "currencyId is required." });
        if (!(/INR/.test(currencyId))) return res.status(400).send({ status: false, message: "Currency Id of product should be in uppercase 'INR' format" });
        //currencyFormat
        if (!isValid(currencyFormat)) return res.status(400).send({ status: false, message: "currencyFormat is required." });
        if (!(/₹/.test(currencyFormat))) return res.status(400).send({ status: false, message: "Currency format/symbol of product should be in '₹' " });

        //checking for style in data 
        if (style) {

            if (!isValid(style) && isValidString(style)) return res.status(400).send({ status: false, message: "Style should be valid an does not contain numbers" });
            if (!titleRegex.test(style)) return res.status(400).send({ status: false, message: " Please provide valid style including characters only." });

        }

        if (availableSizes) {
            let size1 = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            let size2 = availableSizes.toUpperCase().split(",").map((x) => x.trim())
            for (let i = 0; i < size2.length; i++) {
                if (!(size1.includes(size2[i]))) {
                    return res.status(400).send({ status: false, message: "Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'" })

                }
                availableSizes = size2

            }
        }



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
        if (files.length == 0) return res.status(400).send({ status: false, message: "Please upload product image" });
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
//----------------------------------------------------[GET PRODUCT BY ID]----------------------------------------
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

//-----------------------------------------[getByQuery]-----------------------------------
const getByQuery = async function (req, res) {
    try {
        let query = req.query


        if (query.size) {
            let sizes = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            if (!sizes.includes(query.size)) return res.status(400).send({ status: false, message: "Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'" })
            query.availableSizes = query.size
        }

        if (query.name) {
            if (!isValid(query.name)) return res.status(400).send({ status: false, message: "name should be in string & not empty" })
            query.title = query.name
        }
        let less = {}
        let greate = {}
        if (query.priceLessThan) {
            less['price'] = { $lt: parseInt(query['priceLessThan']) }
        }
        if (query.priceGreaterThan) {
            greate['price'] = { $gt: parseInt(query['priceGreaterThan']) }
        }
        let allProducts = await productModel.find({ $and: [query, { isDeleted: false }, less, greate] }).sort({ "price": query['priceSort'] })
        if (allProducts.length == 0) return res.status(404).send({ status: false, message: "no such Product" })

        res.status(200).send({ status: true, message: "Success", data: allProducts })
    }
    catch (error) {
        console.log(error)
        res.status(500).send({ status: false, message: error.message })
    }
}

//-----------------------------------------------[updateProduct]---------------------------------------------------------
const updateProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        let data = req.body
        if (!productId) return res.status(400).send({ status: false, message: "provide productId" })
        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "invalid productId" })
        let checkId = await productModel.findById({ _id: productId })
        if (!checkId) return res.status(404).send({ status: false, message: "no such product" })
        if (checkId.isDeleted == true) return res.status(404).send({ status: false, message: "product is already deleted" })

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "please provide data to update" })

        let { title, description, price, isFreeShipping, productImage, currencyId, currencyFormat, style, availableSizes, installments } = data

        if (title || typeof title == 'string') {
            //if(title ) return res.status(400).send({ status: false, message: "Title is required." });
            if (!isValid(title)) return res.status(400).send({ status: false, message: "Title is required." });
            if (!titleRegex.test(title)) return res.status(400).send({ status: false, message: " Please provide valid title including characters only." });

            //checking for duplicate title
            let checkTitle = await productModel.findOne({ title: data.title });
            if (checkTitle) return res.status(400).send({ status: false, message: "Title already exist" });
        }

        if (description || typeof description == 'string') {

            if (!isValid(description) && isValidString(description)) return res.status(400).send({ status: false, message: "description is required." });
        }
        if (price) {
            if (!isValidString(price) && !isValidPrice(price)) return res.status(400).send({ status: false, message: "price Should be in number only...!" });
        }
        if (currencyId) {
            if (!(/INR/.test(currencyId))) return res.status(400).send({ status: false, message: "Currency Id of product should be in uppercase 'INR' format" });
        }  //currencyFormat
        if (currencyFormat) {
            if (!(/₹/.test(currencyFormat))) return res.status(400).send({ status: false, message: "Currency format/symbol of product should be in '₹' " });
        }

        if (style) {

            if (!isValid(style) && isValidString(style)) return res.status(400).send({ status: false, message: "Style should be valid an does not contain numbers" });
            if (!titleRegex.test(style)) return res.status(400).send({ status: false, message: " Please provide valid style including characters only." });
        }
        if (installments) {
            if (!isValidString(installments)) return res.status(400).send({ status: false, message: "Installments should be in numbers" });
            if (!isValidPrice(installments)) return res.status(400).send({ status: false, message: "Installments should be valid" });
        }
        if (availableSizes) {
            let size1 = ["S", "XS", "M", "X", "L", "XXL", "XL"]
            let size2 = availableSizes.toUpperCase().split(",").map((x) => x.trim())
            for (let i = 0; i < size2.length; i++) {
                if (!(size1.includes(size2[i]))) {
                    return res.status(400).send({ status: false, message: "Sizes should one of these - 'S', 'XS', 'M', 'X', 'L', 'XXL' and 'XL'" })

                }
                availableSizes = size2

            }
        }
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

        //     let files = req.files
        //     if(productImage){

        //     if (files.length == 0) return res.status(400).send({ status: false, message: "Please upload product image" });
        //     if (files && files.length > 0) {
        //         //upload to s3 and get the uploaded link
        //         // res.send the link back to frontend/postman
        //         let uploadedFileURL = await uploadFile(files[0])
        //         newProductData.productImage = uploadedFileURL
        //     }
        // }

        let updateData = await productModel.findOneAndUpdate({
            _id: productId
        },
            data,
            { new: true })
        res.status(200).send({ status: true, message: "product updated", data: updateData })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

const deleteProduct = async function (req, res) {
    try {
        let productId = req.params.productId
        if (!productId) return res.status(400).send({ status: false, message: "provide productId" })
        if (!mongoose.isValidObjectId(productId)) return res.status(400).send({ status: false, message: "invalid productId" })
        let checkId = await productModel.findById({ _id: productId })
        if (!checkId) return res.status(404).send({ status: false, message: "no such product" })
        if (checkId.isDeleted == true) return res.status(404).send({ status: false, message: "product is already deleted" })

        let deletedDoc = await productModel.findOneAndUpdate({ _id: productId }, { isDeleted: true, deletedAt: Date.now() }, { new: true })
        console.log(deletedDoc)
        res.status(200).send({ status: true, message: "product is deleted" })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

module.exports = { addproduct, getByQuery, getProductsById, updateProduct, deleteProduct }
