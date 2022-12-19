const mongoose = require("mongoose");
const PackagesModel = new mongoose.Schema({
  label: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  allowed_listings: {
    type: Number,
    required: true,
  },
});
module.exports = mongoose.model("packages", PackagesModel);
