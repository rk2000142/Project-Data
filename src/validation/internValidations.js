const CollegeModel = require('../models/collegeModel')
const internModel = require('../models/internModel');


const valid = function (str) {
    if (str === undefined || str == null) return false;
    if (typeof str == "string" && str.trim().length == 0) return false;
    return true;
};
const mailRegex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
const mobileRegex = /^[+0]{0,2}(91)?[0-9]{10}$/;

const emailValid = function (str) {
    if (str === undefined || str == null) return "Email must be present";
    if (typeof str == "string" && str.trim().length == 0) return "Email must be present";
    //console.log(regex.test(str))
    if (mailRegex.test(str) == false) return "Please provide valid email";
    return true
};

const checkNumber = function (str) {

    if (typeof str == "string" && str.trim().length == 0) return 'Mobile number cannot be empty'
    if (str.startsWith("0") || str.startsWith("1") || str.startsWith("2") || str.startsWith("3") || str.startsWith("4") || str.startsWith("5")) return `Mobile number cannot start with ${str[0]}`
    if (str.length != 10) return 'Mobile number must be 10 digits'
    if (!mobileRegex.test(str)) return "Mobile number can only contains letters";
    return true
}

exports.validationInter = async function (req, res, next) {
    try {
        const filedAllowed = ["name", "email", "mobile", "collegeName"]
        const data = req.body;
        const keyOf = Object.keys(data);
        const receivedKey = filedAllowed.filter((x) => !keyOf.includes(x));
        if (receivedKey.length) {
            return res.status(400).send({ status: false, msg: `${receivedKey} field is missing` });
        }
        const { name, email, mobile, collegeName } = req.body;
        let nameRegex = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/;
        
        if (!valid(name))
            return res.status(400).send({ status: false, mgs: valid(name) });

        if (!nameRegex.test(name))
            return res.status(400).send({ status: false, msg: "Please provide valid characters only" })

        if (emailValid(email) != true)
            return res.status(400).send({ status: false, mgs: emailValid(email) });

        const isEmailExist = await internModel.find({ email, isDeleted:false})
        if (isEmailExist.length)
            return res.status(400).send({ status: false, mgs: "This email is already being used" });

        if (checkNumber(mobile) != true)
            return res.status(400).send({ status: false, mgs: checkNumber(mobile) });

        const isMobileExist = await internModel.find({ mobile })
        if (isMobileExist.length)
            return res.status(400).send({ status: false, mgs: "This mobile is already being used" });

        if (!valid(collegeName))
            return res.status(400).send({ status: false, mgs: "College name must be present" })

        const existCollege = await CollegeModel.find({ name: collegeName })
        if (existCollege.length == 0 || existCollege == null || existCollege == undefined)
            return res.status(404).send({ status: false, mgs: "College not found" })

        next()

    } catch (error) {
        res.status(500).send({ status: false, mgs: error.message });
    }

}

