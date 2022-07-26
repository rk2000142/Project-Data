const jwt = require("jsonwebtoken") //require jsonwebtoken

//<-------------------------------Authentication------------------------------------------------------//
const authentication = function (req, res, next) {
    try {
        let token = req.headers["authorization"];
        console.log(token)
        const bearer = token.split(" ")
        const bearerToken = bearer[1]
        if (!bearerToken) return res.status(401).send({ status: false, msg: "token must be present" });

        const decoded = jwt.decode(bearerToken);
        if (!decoded) {
            return res.status(401).send({ status: false, message: "Invalid authentication token in request headers " })
        }

        jwt.verify(bearerToken, "Project5-productManagement", function (err, decoded) {
            if (err) {
                return res.status(401).send({ status: false, message: "invalid token" })
            } else {
                req.tokenId = decoded.userId
                return next();
            }
        });
    } catch (error) {
        res.status(500).send({ status: false, msg: error.message })
    }
}

module.exports.authentication = authentication
