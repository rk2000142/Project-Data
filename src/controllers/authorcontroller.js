const authorModel = require("../models/authorModel")


const createAuthor = async function (req, res) {
  try {
    let data = req.body
    if (!data.fname) {
      return res.status(400).send({ status: false, masg: "First name is required" });
    }
    if (!data.lname) {
      return res.status(400).send({ status: false, msg: "Last name is required" });
    }
    if (!data.title) {
      return res.status(400).send({ status: false, msg: "Title is required" });
    }
    if (!data.email) {
      return res.status(400).send({ status: false, msg: "Email is requied" });
    }
    if (!data.password) {
      return res.status(400).send({ status: false, msg: "Password is required" });
    }

    const validateEmail = (/^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/.test(data.email));
    if (!validateEmail) {
      return res.status(400).send({ status: false, msg: "Invalid EmailID,Please check" });
    }

    let savedData = await authorModel.create(data)
    res.status(201).send({ status: true, msg: savedData })
  }
  catch (err) {
    console.log(err)
    res.status(500).send({ status: false, msg: err.message })
  }
}

module.exports.createAuthor = createAuthor

