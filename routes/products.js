const express = require("express");
const Product = require("../Model/Product");
const User = require("../Model/User");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const product = await Product.find().populate("claimedBy", "name");
    res.status(200).send(product);
  } catch (error) {
    console.error(error);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(200).send(product);
  } catch (error) {
    console.error(error);
  }
});

router.post("/", async (req, res) => {
  try {
    const { name, descripton, type, unit, pickUpLocation, pickUpTime, photo } =
      req.body;
    const product = await Product.create({
      name,
      descripton,
      type,
      unit,
      pickUpLocation,
      pickUpTime,
      photo,
    });
    res.status(200).send(product);
  } catch (error) {
    console.error(error);
  }
});

router.put("/claim/:id", async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (item.giveAwayComplete) {
    res.send("Give Away already Completed");
  }
  // const user = await User.findById("60d56eca5af4196642a43d11");
  // if (user.itemOnClaim)
  //   return res.send(
  //     "User already on Claim. A user can only claim an item at a time"
  //   );
  // user.itemOnClaim = req.params.id;
  // user.save();

  !item.claimedBy
    ? (item.claimedBy = "60d56eca5af4196642a43d11")
    : (item.waitlist = "60d56eca5af4196642a43d11");
  await item.save();
  res.status(200).send(item);
});

// Delete the claimer
router.put("/del-claim/:id", async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (item.giveAwayComplete) {
    res.send("Give Away already Completed");
  }
  // If the item is not claimed already
  if (!item.claimedBy) return res.send("No has yet claimed the give away");

  if (item.waitlist) {
    // Waitlisted user will be moved to claimer
    item.claimedBy = item.waitlist;
    item.waitlist = null;
  } else {
    item.claimedBy = null;
  }
  await item.save();
  res.status(200).send(item);
});

module.exports = router;
