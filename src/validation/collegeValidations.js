const CollegeModel = require('../models/collegeModel')

const valid = function (str) {
    if (str === undefined || str == null) return false;
    if (typeof str == "string" && str.trim().length == 0) return false;
    return true;
};

const rex = /^[ A-Za-z_.,]*$/



exports.validationCollege = async function (req, res, next) {
    try {
        const data = req.body;
        const regex = /^\w+([\.-]?\w+)@\w+([\.-]?\w+)(\.\w{2,3})+$/;
        const nRegex = /^[ A-Za-z.,]*$/

        let nameRegex = /^[A-Za-z\s]{1,}[\.]{0,1}[A-Za-z\s]{0,}$/;
        if (Object.keys(data).length === 0) return res.status(404).send({ status: false, msg: "Body should not remain empty" })
        const { name, fullName, logoLink } = data;
        if (!valid(fullName))
            return res.status(400).send({ status: false, mgs: "fullName must be present" });

        if (!valid(logoLink))
            return res.status(400).send({ status: false, mgs: "logoLink must be present" });

        if (!valid(name))
            return res.status(400).send({ status: false, mgs: "name must be present" });

        if (!nameRegex.test(name) || !nameRegex.test(fullName))
            return res.status(400).send({ status: false, msg: "Please enter valid characters only" })

        const resultName = await CollegeModel.find({ name })
        if (resultName.length) return res.status(400).send({ status: false, mgs: "name is already taken " });
        next()
    } catch (error) {
        res.status(500).send({ status: false, mgs: error.message });
    }

}

