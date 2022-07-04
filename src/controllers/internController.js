const InternModel = require("../models/internModel.js");
const CollegeModel = require("../models/collegeModel");

exports.createIntern = async function (req, res) {
  try {
    const { name, email, mobile,collegeName, isDeleted } = req.body
    const existCollege = await CollegeModel.find({ name:collegeName ,isDeleted:false })
    //console.log(existCollege)
    const requireId = existCollege[0]['_id'].toString()
    //console.log(existCollege[0].fullName)
    const savedData = await InternModel.create({ name, email, mobile, collegeId: requireId })
    res.status(201).send({ status: true, mgs: savedData });
  } catch (error) {
    res.status(500).send({ status: false, mgs: error.message });
  }

};


// exports.createIn = function(req, res) {
//   try{
//   const {name, email, mobile, collegeName} = req.body;
//   let nameRegex = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/;
//   let mailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
//   let mobileRegex = /^[+0]{0,2}(91)?[0-9]{10}$/;
//   const savedData = await InternModel.create({data})
//   res.status(201).send({status: true, msg: savedData})
// } catch(err){
//   res.status(500).send({status: false, msg: err.message})
// }
// }