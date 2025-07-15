const nodemailer = require("nodemailer");

exports.sendVerificationEmail = async (email, verificationLink) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Verify your employee account",
        html: `<p>Click the link to verify and set up your account:</p><a href="${verificationLink}">${verificationLink}</a>`
    });
};

exports.sendAccessCodeEmail = async (email, accessCode) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS
        }
    });
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: "Your access code",
            html: `<p>Your access code is: <strong>${accessCode}</strong></p>`
        }); return true;
    } catch (error) {
        console.error("Failed to send email:", error);
        return false;
    }
};
