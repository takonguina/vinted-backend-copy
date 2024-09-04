const express = require("express");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middleware/isAuthenticated");
const router = express.Router();

router.post("/sales", isAuthenticated, async (req, res) => {
  try {
    const filter = { bought: true, owner: req.user };
    const offers = await Offer.find(filter);
    res.json(offers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
