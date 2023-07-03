const jwt = require('jsonwebtoken')
require('dotenv').config()

module.exports = function (req, res, next) {

    // token from fontend
    const token = req.header("access-token")
    if (!token) return res.status(401).json("Access Denied")

    try {
        const verified = jwt.verify(token, process.env.SECRET_CODE)
        req.user = verified;
        next();
    } catch (error) {
        res.status(500).json("Invalid Token")
    }

}

