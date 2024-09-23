const crypto = require("crypto")


const EncryptPassword = (password) => {

    const salt = crypto.randomBytes(16).toString("hex")

    const hashedPassword = crypto.pbkdf2Sync(
        password,
        salt,
        10000,
        64,
        'sha256'
    ).toString('hex');


    return { hashedPassword: hashedPassword, salt: salt }
}


const comparePassword = (password, encryptedpassword, salt) => {
    let result;


    const hashedPassword = crypto.pbkdf2Sync(
        password,
        salt,
        10000,
        64,
        'sha256'
    ).toString('hex');

    if (hashedPassword === encryptedpassword) {
        result = true
    } else {
        result = false
    }
    return result
}


module.exports = { EncryptPassword, comparePassword }