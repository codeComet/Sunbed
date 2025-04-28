const nodemailer = require('nodemailer');
 const sendVerificationEmail = async (email, code) => {
    const transporter = nodemailer.createTransport({
        service: "Gmail",
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
            user: process.env.app_email,
            pass: process.env.app_pass,
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Verification Code',
        text: `Your verification code is ${code}`,
    };

    await transporter.sendMail(mailOptions);
};
module.exports = sendVerificationEmail