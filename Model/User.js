const mongoose = require("mongoose");
const Joi = require("joi");
const passwordComplexity = require("joi-password-complexity");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    trim: true,
    minlength: 2,
    maxlength: 1024,
  },
  password: { type: String, require: true, minlength: 5, maxlength: 1024 },
  phone: { type: Number, require: true, minlength: 5, maxlength: 20 },
  email: { type: String, require: true, unique: true },
  picture: String,
  status: {
    type: String,
    enum: ["Pending", "Active"],
    default: "Pending",
  },
  confirmationCode: { type: String, unique: true },
  giveAwayMades: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  itemRecieved: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  itemOnClaim: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  waitlistedItem: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  resetPasswordToken: String,
  date: { type: Date, default: Date.now },
});

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(30),
    phone: Joi.number(),
    email: Joi.string().email({
      minDomainSegments: 2,
      tlds: { allow: ["com", "net"] },
    }),
  });

  return schema.validate(user);
}

exports.validatePassword = (password) => {
  const complexityOptions = {
    min: 10,
    max: 30,
    lowerCase: 1,
    upperCase: 1,
    numeric: 1,
    symbol: 1,
    requirementCount: 5,
  };

  return passwordComplexity(complexityOptions).validate(password);
};

exports.User = User;
exports.validate = validateUser;
