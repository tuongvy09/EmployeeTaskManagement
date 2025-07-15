const twilio = require("twilio");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhone = process.env.TWILIO_PHONE_NUMBER;

const client = twilio(accountSid, authToken);

exports.sendAccessCodeSMS = async (toPhone, code) => {
    console.log("test", accountSid, authToken, twilioPhone);
    try {
        const message = await client.messages.create({
            body: `Your access code is: ${code}`,
            from: twilioPhone,
            to: toPhone
        });

        console.log("SMS sent:", message.sid);
        return true;
    } catch (error) {
        console.error("Failed to send SMS:", error);
        return false;
    }
};