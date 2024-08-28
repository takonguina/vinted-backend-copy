const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
const cors = require("cors");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI);

const app = express();
app.use(cors());
app.use(express.json());
app.use(authRoutes);
app.use("/offer", offerRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
