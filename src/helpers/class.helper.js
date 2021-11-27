const { classModel, Class } = require("../models/class.model")
const nodemailer = require("nodemailer");


const isOwnerClass = async (userId, classId) => {
    let myClass = await classModel.findOne({ id: classId });

    if (!myClass || myClass.ownerId.indexOf(userId) < 0) {
        return false
    }
    else return true
}


const isMemberClass = async (userId, classId) => {
    let myClass = await classModel.findOne({ id: classId });

    if (!myClass || myClass.ownerId.indexOf(userId) < 0) {
        return false // not exists
    }
    else return true // exists
}

const sendEmail = async ({email, content}) => {
    // let testAccount = await nodemailer.createTestAccount();

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'midtermweb1@gmail.com', // generated ethereal user
            pass: '12@abcdef', // generated ethereal password
        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'midtermweb1@gmail.com', // sender address
        to: email, // list of receivers
        subject: "Hello ✔", // Subject line
        text: content, // plain text body
        // html: "<b>Hello world?</b>", // html body
    });

    console.log("Message sent: %s", info.messageId);

    // Preview only available when sending through an Ethereal account
    // console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}

module.exports = {
    isOwnerClass,
    isMemberClass,
    sendEmail
}