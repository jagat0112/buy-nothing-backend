const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require("twilio")(
  "ACc693bdc608d5ec2f2293ff62015e2490",
  "b4cb5ede8677d113834eb9694aa9597e"
);

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
