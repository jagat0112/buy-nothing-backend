const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Model/User");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  const logged = await bcrypt.compare(password, user.password);

  //   Incase of invalid Password
  if (!logged) return res.status(403).send("Invalid Creditionals");

  //   If password is correct
  const token = jwt.sign({ _id: user._id }, "jwtSecret");

  res.status(200).send(token);
});

module.exports = router;
