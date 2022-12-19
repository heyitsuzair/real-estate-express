const mongoose = require("mongoose");
const UsersModel = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone_no: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "packages",
    required: true,
  },
  remaining_listings: {
    type: Number,
    required: true,
  },
  total_reviews: {
    type: Number,
    required: true,
    default: 0,
  },
  rating: {
    type: Number,
    required: true,
    default: 0,
  },
});
module.exports = mongoose.model("users", UsersModel);
