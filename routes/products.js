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

// Adding a Claimer
router.put("/claim/:id", async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (item.giveAwayComplete) {
    res.send("Give Away already Completed");
  }
  const user = await User.findById("60d73e2c4ae39314a2ad1909");
  if (!user) return res.send("User doest not exists");

  if (user.itemOnClaim)
    return res.send(
      "User already on Claim. A user can only claim an item at a time"
    );
  user.itemOnClaim = req.params.id;
  user.save();

  !item.claimedBy
    ? (item.claimedBy = "60d73e2c4ae39314a2ad1909")
    : (item.waitlist = "60d73e2c4ae39314a2ad1909");
  await item.save();
  res.status(200).send(item);
});

// Remove the claimer
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

// Completing the giveaway

router.put("/complete/:id", async (req, res) => {
  const item = await Product.findById(req.params.id);
  item.giveAwayComplete = true;
  await item.save();
  res.send("Giveaway complete");
  // Making the claimer ownder of the giveaway
  const claimer = await User.findById(item.claimedBy);
  claimer.itemRecieved.push(req.params.id);
  claimer.itemOnClaim = null;
  claimer.save();
  // Removing the waitlist
  const waitingUser = await User.findById(item.waitlist);
  if (waitingUser) {
    waitingUser.waitlistedItem = [];
    waitingUser.save();
  }
});

// Deleteing a giveaway.

router.delete("/:id", async (req, res) => {
  try {
    const item = await Product.findById(req.params.id);

    // Making the claimer ownder of the giveaway
    const claimer = await User.findById(item.waitlist);

    if (claimer) {
      claimer.itemRecieved = null;
      claimer.save();
    }
    // Removing the waitlist
    const waitingUser = await User.findById(item.waitlist);

    if (waitingUser) {
      waitingUser.waitlistedItem = [];
      waitingUser.save();
    }
    await item.remove();

    res.status(200).send("Successfully Deleted");
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
