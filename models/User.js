const mongoose = require("mongoose");

const User = mongoose.model("User", {
  email: {
    type: String,
  },
  account: {
    type: Object,
    username: {
      type: String,
    },
    avatar: {
      type: Object,
    },
  },
  newsletter: {
    type: Boolean,
    default: false,
  },
  token: {
    type: String,
  },
  hash: {
    type: String,
  },
  salt: {
    type: String,
  },
});

module.exports = User;
