const express = require("express");
const router = express.Router();
const fetchUser = require("../middleware/fetchUser");
const {
  addProperty,
  deleteProperty,
  getProperty,
  getProperties,
  getSellerProperties,
  updateProperty,
  searchProperties,
  filterProperties,
} = require("../controllers/PropertiesController");
router.post("/add-property", fetchUser, addProperty);
router.delete("/delete-property/:id", fetchUser, deleteProperty);
router.get("/get-property/:id", getProperty);
router.get("/get-properties/:page_no/:limit", getProperties);
router.get("/get-seller-properties", fetchUser, getSellerProperties);
router.put("/update-property/:id", fetchUser, updateProperty);
router.get("/search-properties/:query/:limit/:pageNo", searchProperties);
router.get(
  "/filter-properties/:page_no/:limit/:area/:status/:type",
  filterProperties
);

module.exports = router;
