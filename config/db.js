const mongoose = require("mongoose");

module.exports = () => {
  try {
    mongoose.connect(
      "mongodb+srv://jagat0112:Pradhan@0112@cluster0.tfivk.mongodb.net/buynothing?retryWrites=true&w=majority",
      { useNewUrlParser: true, useUnifiedTopology: true }
    );
    console.log("MongoDB Connected.");
  } catch (error) {
    console.error(error);
  }
};
