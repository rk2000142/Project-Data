const authorModel = require("../models/authorModel")
const jwt = require("jsonwebtoken");



//=========================================== 1-Create Author Api ====================================================//


const isValidRequestBody= function(requestBody){
  return Object.keys(requestBody).length >0
}

const createAuthor = async function (req, res) {
  try { 
    const requestBody=req.body;
    if (!isValidRequestBody(requestBody)){
      res.status(400).send({status : false, msg : "Please provide Author details" })
    }
    let {fname, lname, title, email, password} = requestBody   //Object Destructuring
 
    //fname validation 
    if (!fname) {
      return res.status(400).send({ status: false, msg: "First name is required" });
    } 
    if (!fname.match(/^[a-zA-Z]+$/)) {
      return res.status(400).send({ status: false, msg: "Not a valid first name, Use Alphabets only" });
    }
    
    //lname validation
    if (!lname) {
      return res.status(400).send({ status: false, msg: "Last name is required" });
    }
    if (!lname.match(/^[a-zA-Z]+$/)) {
      return res.status(400).send({ status: false, msg: "Not a valid last name, Use Alphabets only" });
    }

    //title validation
    if (!title) {
      return res.status(400).send({ status: false, msg: "Title is required" });
    }
    if (["Mr", "Mrs", "Miss"].indexOf(title) == -1) {
      return res.status(400).send({ status: false, msg: "title must be 'Mr', 'Mrs' or 'Miss' only" })
    }

    //email validation
    if (!email) {
      return res.status(400).send({ status: false, msg: "Email is requied" });
    }
    const validateEmail = (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(email));
    if (!validateEmail) {
      return res.status(400).send({ status: false, msg: "Invalid emailid format,Please check" });
    }
    //checking if email is already in use
    let emailCheck = await authorModel.findOne({ email: email })
    if (emailCheck) {
      return res.status(400).send({ status: false, msg: "Email-Id already Registerd" })
    }

    //password validation
    if (!password) {
      return res.status(400).send({ status: false, msg: "Password is required" });
    }
    
    //Author creation
    let authorData={fname, lname, title, email, password}
    let savedData = await authorModel.create(authorData)

    res.status(201).send({ status: true, data: savedData })
  }

  catch (err) {
    console.log(err)
    res.status(500).send({ status: false, msg: err.message })
  }
}




//============================================ 2-Login and Token Generation Api =====================================//


const loginAuthor = async function (req, res) {
  try {
    let email = req.body.email
    let password = req.body.password

    //Finding credentials 
    let user = await authorModel.findOne({ email: email, password: password })
    if (!user) {
      return res.status(404).send({ status: false, msg: "Invalid email or password" })
    }

    //Token generation
    let token = jwt.sign({
      authorId: user._id.toString(),
    },
      "functionUp-radon"
    );
    res.setHeader("x-api-key", token);

    res.status(200).send({ status: true, data: {token} });
  } 
  
  catch (err) {
    res.status(500).send({ status: false, msg: err.message })
  }
};






module.exports.createAuthor = createAuthor
module.exports.loginAuthor = loginAuthor