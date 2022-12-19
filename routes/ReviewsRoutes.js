const express = require("express");
const {
  addReview,
  getSellerReviews,
} = require("../controllers/ReviewsController");
const fetchUser = require("../middleware/fetchUser");
const router = express.Router();

router.post("/add-review/:id", addReview);
router.get("/get-seller-reviews", fetchUser, getSellerReviews);

module.exports = router;
