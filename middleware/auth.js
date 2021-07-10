const config = require("config");
const jwt = require("jsonwebtoken");
const { User } = require("../Model/User");

module.exports = async function (req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.send("No Token Found");

  try {
    const id = jwt.verify(token, config.get("jwtSecret"));
    req.user = id;
    const user = await User.findById(req.user._id);
    // if (user.status === "Pending")
    //   return res.status(400).send("User have not yet verified the email");
    next();
  } catch (error) {
    console.error(error);
  }
};
