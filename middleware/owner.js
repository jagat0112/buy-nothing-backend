const Product = require("../Model/Product");
const { User } = require("../Model/User");

module.exports = async function (req, res, next) {
  const user = await User.findById(req.user._id);
  if (!user)
    return res.status(404).send(`No User is found with id of ${req.user._id}`);

  const item = await Product.findById(req.params.id);
  if (!item)
    return res.status(404).send(`No Item is found with id of ${req.params.id}`);
  req.item = item._id;

  if (user._id.toString() !== item.author.toString())
    return res.status(403).send("Un-authorized");
  next();
};
