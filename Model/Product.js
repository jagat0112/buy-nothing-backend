const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  name: { type: String, require: true, trim: true },
  descripton: { type: String, trim: true, min: 5, max: 200 },
  type: {
    type: String,
    enum: ["clothings", "smartPhone", "books"],
  },
  unit: Number,
  pickUpLocation: String,
  pickUpTime: String,
  claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  giveAwayComplete: { type: Boolean, default: false },
  photo: {
    type: String,
    default: "no-photo.jpg",
  },
  waitlist: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, default: Date.now },
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
