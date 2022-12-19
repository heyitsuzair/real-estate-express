const express = require("express");
const router = express.Router();
const {
  addPackage,
  getPackage,
  getPackages,
  updatePackage,
} = require("../controllers/PackagesController");
router.post("/add-package", addPackage);
router.get("/get-package/:id", getPackage);
router.get("/get-packages", getPackages);
router.put("/update-package/:id", updatePackage);

module.exports = router;
