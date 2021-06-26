const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, require: true, trim: true },
  password: { type: String, require: true },
  phone: { type: Number, require: true },
  email: { type: String, require: true },
  photo: String,
  giveAwayMades: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  itemRecieved: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  itemOnClaim: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  waitlistedItem: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  date: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

module.exports = User;
