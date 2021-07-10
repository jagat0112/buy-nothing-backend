const express = require("express");
const connectDB = require("./config/db");
const Product = require("./routes/products");
const User = require("./routes/users");
const Auth = require("./routes/auth");
const cors = require("cors");
const multer = require("multer");
const path = require("path");

const app = express();
connectDB();

app.set("view engine", "ejs");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "Images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage });

// const upload = multer({ storage: storage });
app.get("/uploads", function (req, res) {
  res.render("upload");
});

app.post("/uploads", upload.single("image"), (req, res) => {
  console.log(req.file.mimetype);
  if (req.file.mimetype !== "image/jpeg")
    return res
      .status(401)
      .send({ message: "Only image files can be uploaded" });
  res.json({ message: "Successfully uploaded files" });
});

app.use(express.json());
app.use(cors());

process.on("unhandledRejection", (err) => {
  console.log(err);
});

app.use("/api/products", Product);
app.use("/api/users", User);
app.use("/api/auths", Auth);

const PORT = process.env.PORT || 5002;
app.listen(PORT, console.log(`Server Started at ${PORT}`));
