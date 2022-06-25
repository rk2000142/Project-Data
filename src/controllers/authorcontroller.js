const authorModel = require("../models/authorModel")
const jwt = require("jsonwebtoken");



const createAuthor = async function (req, res) {
  try {
    let data = req.body

    if (Object.keys(data).length == 0) {
      return res.status(400).send({ status: false, msg: "Please provide details" });
    }

    if (!data.fname) {
      return res.status(400).send({ status: false, msg: "First name is required" });
    }
    if (!isNaN(data.fname)) {
      return res.status(400).send({ status: false, msg: "Not a valid first name" });
    }
    
    if (!data.lname) {
      return res.status(400).send({ status: false, msg: "Last name is required" });
    }
    if (!isNaN(data.lname)) {
      return res.status(400).send({ status: false, msg: "Not a valid last name" });
    }

    if (!data.title) {
      return res.status(400).send({ status: false, msg: "Title is required" });
    }
    if (["Mr", "Mrs", "Miss"].indexOf(data.title) == -1) {
      return res.status(400).send({ status: false, msg: "title must be 'Mr', 'Mrs' or 'Miss' only" })
    }

    if (!data.email) {
      return res.status(400).send({ status: false, msg: "Email is requied" });
    }
    const validateEmail = (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(data.email));
    if (!validateEmail) {
      return res.status(400).send({ status: false, msg: "Invalid emailid format,Please check" });
    }
    let emailCheck = await authorModel.findOne({ email: data.email })
    if (emailCheck) {
      return res.status(400).send({ status: false, msg: "Email-Id already Registerd" })
    }


    if (!data.password) {
      return res.status(400).send({ status: false, msg: "Password is required" });
    }
    

    let checkAuthor=await authorModel.findOne(data)
    if(checkAuthor) {
      return res.status(400).send({ status: false, msg: "Author already exists" })
    }

    let savedData = await authorModel.create(data)
    res.status(201).send({ status: true, data: savedData })
  }
  catch (err) {
    console.log(err)
    res.status(500).send({ status: false, msg: err.message })
  }
}




const loginAuthor = async function (req, res) {
  try {
    let email = req.body.email
    let password = req.body.password
    let user = await authorModel.findOne({ email: email, password: password })
    if (!user) {
      return res.status(404).send({ status: false, msg: "Invalid email or password" })
    }
    let token = jwt.sign({
      authorId: user._id.toString(),
    },
      "functionUp-radon"
    );
    res.setHeader("x-api-key", token);
    res.status(200).send({ status: true, data: token });
  } catch (err) {
    res.status(500).send({ status: false, msg: err.message })
  }
};


module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor



