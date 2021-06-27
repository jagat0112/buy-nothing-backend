const express = require("express");
const connectDB = require("./config/db");
const Product = require("./routes/products");
const User = require("./routes/users");
const Auth = require("./routes/auth");

const app = express();
connectDB();

app.use(express.json());

process.on("unhandledRejection", (err) => {
  console.log(err);
});

app.use("/api/products", Product);
app.use("/api/users", User);
app.use("/api/auths", Auth);

const PORT = process.env.PORT || 5002;
app.listen(PORT, console.log(`Server Started at ${PORT}`));
