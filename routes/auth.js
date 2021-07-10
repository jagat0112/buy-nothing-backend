const express = require("express");
const bcrypt = require("bcrypt");
const config = require("config");
const jwt = require("jsonwebtoken");
const { User, validate, validatePassword } = require("../Model/User");
const { OAuth2Client } = require("google-auth-library");
const { sendResetToken } = require("../config/nodemailer");
const sendVerificationSMS = require("../config/send_sms");
const auth = require("../middleware/auth");

const router = express.Router();

const client = new OAuth2Client(config.get("GOOGLE_CLIENT_ID"));

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  // Custom Validation
  const { error } = validate({ email, password });
  if (error) return res.send(error.details[0].message);
  // Finding the user
  const user = await User.findOne({ email });
  if (!user) return res.status(404).send("User Not Found");
  const logged = await bcrypt.compare(password, user.password);

  //   Incase of invalid Password
  if (!logged) return res.status(403).send("Invalid Creditionals");

  //   If password is correct
  const token = jwt.sign({ _id: user._id }, config.get("jwtSecret"));

  res.status(200).send(token);
});

router.get("/confirm/:confirmationCode", async (req, res) => {
  const { confirmationCode } = req.params;
  const user = await User.findOne({ confirmationCode });
  user.confirmationCode = "";
  user.email.verification = true;
  await user.save();
  res.status(200).send("User Activated");
});

router.post("/googlelogin", async (req, res) => {
  const { token } = req.body;
  const resp = await client.verifyIdToken({
    idToken: token,
    audience: config.get("GOOGLE_CLIENT_ID"),
  });

  const { email, email_verified, name, picture } = resp.payload;
  if (email_verified) {
    const user = await User.findOne({ email });
    if (user) {
      const token = jwt.sign({ _id: user._id }, config.get("jwtSecret"));
      res.send({ token: token });
      console.log(token);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashed = await bcrypt.hash(
        `${email}${config.get("jwtSecret")}`,
        salt
      );
      const newUser = new User({
        name,
        email: { email, verification: true },
        picture,
        password: hashed,
        phone: { number: 00000 },
      });
      await newUser.save();
      res.status(200).send(newUser);
      console.log(newUser);
    }
  }
});

router.post("/facebooklogin", async (req, res) => {
  const { accessToken, userID } = req.body;
  console.log(accessToken, userID);
  // let urlGraphFacebook = `https://graph.facebook.com/v2.11/${accessToken}/?fields=id,email,name&access_token=${userID}`;
});

router.get("/forget-password", async (req, res) => {
  const { loginCreditionals } = req.body;
  // Finding the user based on Number or Email
  let reset;
  if (typeof loginCreditionals === "number") {
    const user = await User.findOne({ phone: loginCreditionals });
    if (!user)
      return res
        .status(400)
        .send({ message: `User Not Found with this phone number` });
    reset = user;
  } else {
    const user = await User.findOne({ email: loginCreditionals });
    if (!user)
      return res
        .status(400)
        .send({ message: `User Not Found with this email` });
    reset = user;
  }
  // Assinging the resetToken to the User
  reset.resetPasswordToken = jwt.sign(
    { _id: reset._id },
    config.get("jwtSecret")
  );
  await reset.save();
  sendResetToken(reset.name, reset.email, reset.resetPasswordToken);
  res.status(200).send({ message: "Please check for reset link in the email" });
});

router.put("/reset-password/:confirmationCode", async (req, res) => {
  const { confirmationCode } = req.params;
  const user = await User.findOne({ resetPasswordToken: confirmationCode });
  if (!user)
    return res.status(401).send({ message: "Invalid Confimation Code" });
  // Validating password
  const { error: err } = validatePassword(req.body.password);
  if (err) return console.log(err.details[0].message);
  // Hashing Password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(req.body.password, salt);
  user.password = hash;
  user.resetPasswordToken = "";
  await user.save();
  res.status(200).send({ message: "Password Changed Successfully" });
});

router.get("/send-phone-verify-code", auth, async (req, res) => {
  const user = await User.findById(req.user._id);
  user.phone.code = Math.floor(Math.random() * 10000);
  await user.save();
  try {
    await sendVerificationSMS(user.phone.number, user.phone.code);
  } catch (error) {
    console.log(error);
  }
  res.status(200).send({ message: "Verfication Code Sent." });
});

router.post("/verify-phone", auth, async (req, res) => {
  const { code } = req.body;
  const user = await User.findById(req.user._id);
  if (user.phone.code == code) {
    user.status = "Active";
    user.phone.verification = true;
    user.phone.code = 0;
    await user.save();
    res.status(200).send({ message: "Phone Number Successfully Verified" });
  } else {
    res.status(400).send({ message: "Invalid Token" });
  }
});

module.exports = router;
