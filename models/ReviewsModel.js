const mongoose = require("mongoose");
const ReviewsModel = new mongoose.Schema(
  {
    stars: {
      type: Number,
      required: true,
      max: 5,
    },
    msg: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    website: {
      type: String,
    },
    property_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "properties",
      required: true,
    },
  },
  { timestamps: true }
);
module.exports = mongoose.model("reviews", ReviewsModel);
