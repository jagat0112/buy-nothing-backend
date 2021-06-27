const express = require("express");
const _ = require("lodash");
const bcrypt = require("bcrypt");
const User = require("../Model/User");
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
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);
    const product = await User.create({
      name,
      phone,
      email,
      photo,
      password: hashed,
    });

    res.status(200).send(_.pick(product, ["name", "phone", "email"]));
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
