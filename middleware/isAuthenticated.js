const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  if (req.headers.authorization) {
    const user = await User.findOne(
      {
        token: req.headers.authorization.replace("Bearer ", ""),
      },
      "_id account"
    );
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    } else {
      req.user = user;
      return next();
    }
  } else {
    return res.status(401).json({ error: "Missing token" });
  }
};

module.exports = isAuthenticated;
