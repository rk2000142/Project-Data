const CollegeModel = require('../models/collegeModel')

const valid = function (str) {
    if (str === undefined || str == null) return false;
    if (typeof str == "string" && str.trim().length == 0) return false;
    return true;
};



exports.validationCollege = async function (req, res, next) {
    try {
        const data = req.body;
        const nameRegex = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/;
        const nRegex = /^[ A-Za-z.,]*$/
        if (Object.keys(data).length === 0) return res.status(404).send({ status: false, msg: "Body should not remain empty" })
        const { name, fullName, logoLink } = data;
        if (!valid(fullName))
            return res.status(400).send({ status: false, mgs: "FullName cannot be empty" });

        if (!valid(logoLink))
            return res.status(400).send({ status: false, mgs: "LogoLink cannot be empty" });

        if (!valid(name))
            return res.status(400).send({ status: false, mgs: "Name cannot be empty" });

        if (!nameRegex.test(name))
            return res.status(400).send({ status: false, msg: "Name contains invalid characters" })
        if (!nRegex.test(fullName)) return res.status(400).send({ status: false, msg: "Full name contains invalid characters" })

        const resultName = await CollegeModel.find({ name })
        if (resultName.length) return res.status(400).send({ status: false, mgs: "Name is already taken " });
        next()
    } catch (error) {
        res.status(500).send({ status: false, mgs: error.message });
    }

}
