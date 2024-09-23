const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.SENDEREMAIL,
        pass: process.env.PASSWORDMAIL
    }
});


const SendMail = async (mailOptions) => {
    let result;
    try {
        result = await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error(error);
    }
    return result
}


module.exports = SendMail



