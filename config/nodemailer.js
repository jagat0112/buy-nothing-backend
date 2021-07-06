const nodemailer = require("nodemailer");
const config = require("config");

const user = config.get("user");
const pass = config.get("pass");

const transport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: user,
    pass: pass,
  },
});

exports.sendConfirmationEmail = (name, email, confirmationCode) => {
  console.log("Check");
  transport
    .sendMail({
      from: user,
      to: email,
      subject: "Please confirm your account",
      html: `<h1>Email Confirmation</h1>
          <h2>Hello ${name}</h2>
          <p>Thank you for subscribing. Please confirm your email by clicking on the following link</p>
          <a href=${config.get(
            "baseUrl"
          )}/auths/confirm/${confirmationCode}> Click here</a>
          </div>`,
    })
    .then(() => console.log("Email for Confirmation sent"))
    .catch((err) => console.log(err));
};

exports.sendResetToken = (name, email, confirmationCode) => {
  console.log("Check");
  transport
    .sendMail({
      from: user,
      to: email,
      subject: "Reset Password",
      html: `<h1>Reset Password</h1>
          <h2>Hello ${name}</h2>
          <p>Please click on below link to reset your password</p>
          <a href=${config.get(
            "baseUrl"
          )}/auths/reset-password/${confirmationCode}> Click here</a>
          </div>`,
    })
    .then(() => console.log("Email for Reset sent"))
    .catch((err) => console.log(err));
};
