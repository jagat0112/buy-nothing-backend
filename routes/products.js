const express = require("express");
const mongoose = require("mongoose");
const Fawn = require("fawn");
const Product = require("../Model/Product");
const { User } = require("../Model/User");
const auth = require("../middleware/auth");
const owner = require("../middleware/owner");
const upload = require("../middleware/uploading");

const router = express.Router();

Fawn.init(mongoose);

var task = Fawn.Task();

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
// Add an giveaway
router.post("/", auth, async (req, res) => {
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
      author: req.user._id,
    });
    res.status(200).send(product);
  } catch (error) {
    console.error(error);
  }
});

// Adding a Claimer
router.put("/claim/:id", auth, async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (!item) return res.status(404).send("No item found with this id");

  if (item.giveAwayComplete) {
    return res.send("Give Away already Completed");
  }
  const user = await User.findById(req.user._id);
  if (!user) return res.send("User doest not exists");
  if (user._id.toString() === item.author.toString()) {
    return res.status(401).send("Owner cannot claim the this product");
  }
  if (user.itemOnClaim) {
    return res.send(
      "User already on Claim. A user can only claim an item at a time"
    );
  } else {
    user.itemOnClaim = req.params.id;
    await user.save();
  }

  !item.claimedBy
    ? (item.claimedBy = req.user._id)
    : (item.waitlist = req.user._id);
  await item.save();
  res.status(200).send(item);
});

// Remove the claimer
router.put("/del-claim/:id", auth, owner, async (req, res) => {
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
router.put("/complete/:id", auth, owner, async (req, res) => {
  const item = await Product.findById(req.params.id);
  if (item.giveAwayComplete)
    return res.status(400).send("Give Away of this item is already completed");
  if (!item)
    return res.status(404).send(`No Item is found with id of ${req.params.id}`);

  // Making the claimer ownder of the giveaway
  const claimer = await User.findById(item.claimedBy);
  if (!claimer)
    return res
      .status(404)
      .send(`No Claimer is found with id of ${item.claimedBy}`);
  claimer.itemRecieved.push(req.params.id);

  claimer.save();
  // Removing the waitlist
  const waitingUser = await User.findById(item.waitlist);
  if (waitingUser) {
    waitingUser.waitlistedItem = [];
    waitingUser.save();
  }
  // Adding giveaway in the ac of owner
  const owner = await User.findById(req.user._id);
  owner.giveAwayMades.push(req.params.id);
  await owner.save();
  await task
    .update("products", { _id: item._id }, { giveAwayComplete: true })
    .update("users", { _id: item.claimedBy }, { itemOnClaim: null })
    .run();

  res.send("Giveaway complete");
});

// Deleteing a giveaway.
router.delete("/:id", auth, owner, async (req, res) => {
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

// Adding picture

router.post("/upload/:id", upload.single("image"), async (req, res) => {
  res.send({ message: "Image uploaded Successfully" });
});

module.exports = router;
