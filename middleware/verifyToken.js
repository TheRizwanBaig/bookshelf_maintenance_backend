const jwt = require("jsonwebtoken")

function verifyToken(token, callback) {
    jwt.verify(token, process.env.ENCRYPTION_SECRET_USER, (err, decoded) => {
        if (err) {
            // console.log('err block')
            return callback({
                isValid: false,
                _id: null,
                name: null
            });
        } else if (decoded) {
            // console.log(decoded)
            // console.log('decoded block')
            return callback({
                isValid: true,
                _id: decoded._id,
                name: decoded.name,
                email: decoded.email
            })
        } else {
            // console.log('null block')
            return callback({
                _id: null,
                name: null,
                email: null
               
            });
        }
    })
}

module.exports = verifyToken