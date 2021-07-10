const express = require("express");
const _ = require("lodash");
const config = require("config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, validate, validatePassword } = require("../Model/User");
const { sendConfirmationEmail } = require("../config/nodemailer");

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate(
      "itemOnClaim",
      "name"
    );
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
  }
});

router.post("/register", async (req, res) => {
  try {
    const { name, phone, email, photo, password } = req.body;
    const existing = await User.findOne({ email: { email } });
    if (existing)
      return res.status(400).send("User already exists with this email");
    const existingNumber = await User.findOne({ phone: { number: phone } });
    console.log(existingNumber);
    if (existingNumber)
      return res.status(400).send("User already exists with this number");
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const { error } = validate({ name, phone, email });

    const { error: err } = validatePassword(password);
    if (err) return console.log(err.details[0].message);

    if (error) return res.send(error.details[0].message);
    const user = await User.create({
      name,
      phone: { number: phone },
      email: { email },
      photo,
      password: hashed,
      confirmationCode: jwt.sign({ email }, "123456"),
    });

    //   If password is correct
    const token = jwt.sign({ _id: user._id }, config.get("jwtSecret"));
    sendConfirmationEmail(user.name, user.email, user.confirmationCode);
    res
      .header("x-auth-token", token)
      .status(200)
      .send(_.pick(user, ["name", "phone", "email"]));
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
