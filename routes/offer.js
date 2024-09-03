const express = require("express");
const fileupload = require("express-fileupload");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middleware/isAuthenticated");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const router = express.Router();

const convertToBase64 = (file) => {
  return `data:${file.mimetype};base64,${file.data.toString("base64")}`;
};

router.post("/publish", isAuthenticated, fileupload(), async (req, res) => {
  try {
    const pictureToUpload = convertToBase64(req.files.picture);
    const { title, description, price, condition, city, brand, size, color } =
      req.body;

    const newOffer = new Offer({
      product_name: title,
      product_description: description,
      product_price: price,
      product_details: [
        { MARQUE: brand },
        { TAILLE: size },
        { ÉTAT: condition },
        { COULEUR: color },
        { EMPLACEMENT: city },
      ],
      owner: req.user,
    });
    const cloudbinaryResult = await cloudinary.uploader.upload(
      pictureToUpload,
      { folder: `vinted/offer/${newOffer._id}` }
    );
    (newOffer.product_image = {
      secure_url: cloudbinaryResult.secure_url,
    }),
      await newOffer.save();
    res.json(newOffer);
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
  }
});

router.put("/modify/:id", isAuthenticated, fileupload(), async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "_id account"
    );
    console.log(offer);
    if (offer) {
      const {
        title,
        description,
        price,
        condition,
        city,
        brand,
        size,
        color,
        bought,
      } = req.body;

      if (bought) {
        offer.bought = bought;
      }

      if (title) {
        offer.product_name = title;
      }
      if (description) {
        offer.product_description = description;
      }
      if (price) {
        offer.product_price = price;
      }
      if (brand) {
        offer.product_details[0]["MARQUE"] = brand;
      }
      if (size) {
        offer.product_details[1]["TAILLE"] = size;
      }
      if (condition) {
        offer.product_details[2]["ÉTAT"] = condition;
      }
      if (color) {
        offer.product_details[3]["COULEUR"] = color;
      }
      if (city) {
        offer.product_details[4]["EMPLACEMENT"] = city;
      }
      offer.save();
      res.json(offer);
    }
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("", async (req, res) => {
  try {
    const { title, priceMin, priceMax, sort, page } = req.query;
    const filter = { bought: undefined };
    let sorted;

    if (sort) {
      sorted = { product_price: sort.replace("price-", "") };
    }

    if (title) {
      filter.product_name = new RegExp(title, "i");
    }

    if (priceMin || priceMax) {
      filter.product_price = {};
      if (priceMin) {
        filter.product_price.$gte = priceMin;
      }

      if (priceMax) {
        filter.product_price.$lte = priceMax;
      }
    }

    const offers = await Offer.find(filter)
      .sort(sorted)
      .populate("owner", "_id account");
    // 2 is the limit by page
    // .skip((page - 1) * 2)
    // .limit(2);
    const response = {
      count: offers.length,
      offers: offers,
    };

    res.json(response);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const offer = await Offer.findById(req.params.id).populate(
      "owner",
      "_id account"
    );
    res.json(offer);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
