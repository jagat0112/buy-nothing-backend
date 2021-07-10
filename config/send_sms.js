const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(accountSid, authToken);

module.exports = (number, code) => {
  client.messages
    .create({
      body: `Use following code to register your number. CODE: ${code}`,
      from: "+14798887992",
      to: `+977${number}`,
    })
    .then((message) => {
      console.log(message.sid);
      console.log(number, code);
    });
  console.log(number, code);
};
