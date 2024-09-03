const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
const cors = require("cors");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI);
const stripe = require("stripe")(process.env.SK_STRIPE);

const app = express();
app.use(cors());
app.use(express.json());
app.use(authRoutes);
app.use("/offer", offerRoutes);

app.post("/payment", async (req, res) => {
  const { amount, title } = req.body;
  try {
    // On crée une intention de paiement
    const paymentIntent = await stripe.paymentIntents.create({
      // Montant de la transaction
      amount: amount,
      // Devise de la transaction
      currency: "eur",
      // Description du produit
      description: title,
    });
    // On renvoie les informations de l'intention de paiement au client
    res.json(paymentIntent);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.all("*", (req, res) => {
  res.status(404).json({ message: "This route does not exist" });
});

app.listen(process.env.PORT, () => {
  console.log("Server started");
});
