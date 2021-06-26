const express = require("express");
const User = require("../Model/User");
const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.status(200).send(user);
  } catch (error) {
    console.error(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, phone, email, photo, password } = req.body;
    const product = await User.create({ name, phone, email, photo });
    res.status(200).send(product);
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
