const express = require("express");
const User = require("../models/User");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const uid2 = require("uid2");

const router = express.Router();

router.post("/user/signup", async (req, res) => {
  try {
    if (
      req.body.username &&
      req.body.email &&
      req.body.password &&
      req.body.newsletter
    ) {
      // Check if user already exist
      const checkUser = await User.findOne({ email: req.body.email });
      if (checkUser) {
        return res.status(409).json({ message: "email already registered" });
      } else {
        // Hashing
        const password = req.body.password;
        const salt = uid2(16);
        const hash = SHA256(password + salt).toString(encBase64);
        const token = uid2(16);
        const newUser = new User({
          email: req.body.email,
          account: {
            username: req.body.username,
            avatar: {},
          },
          token: token,
          newsletter: req.body.newsletter,
          hash: hash,
          salt: salt,
        });
        await newUser.save();
        const user = await User.findOne(
          { email: req.body.email },
          "_id token account"
        );
        res.json(user);
      }
    } else {
      res.status(404).json({ message: "Missing field(s)" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    // Check if user already exist
    const checkUser = await User.findOne({ email: req.body.email });
    if (checkUser) {
      const password = req.body.password;
      const salt = checkUser.salt;
      const newHash = SHA256(password + salt).toString(encBase64);
      if (newHash === checkUser.hash) {
        const user = await User.findOne(
          { email: req.body.email },
          "_id token account"
        );
        return res.json(user);
      } else {
        return res.status(401).json({ message: "Wrong password" });
      }
    } else {
      return res.status(404).json({ message: "email does not registered" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
