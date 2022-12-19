const PackagesModel = require("../models/PackagesModel");
module.exports.addPackage = async (req, res) => {
  try {
    /**
     * Incoming Data
     */
    const { label, price, allowed_listings } = req.body;

    /**
     * ?Adding Incoming Data To Database -------------->
     */
    const is_package_added = await PackagesModel.create({
      label,
      price,
      allowed_listings,
    });
    /**
     * !Adding Incoming Data To Database -------------->
     */

    /**
     * ?Checking If Data Is Added Or Not,If Data Added Than Return Error Free Response Else Return An Error ------------->
     */

    if (is_package_added) {
      return res.status(200).json({ error: false, msg: "Package Added!" });
    }

    return res.status(400).json({ error: true, msg: "Something Went Wrong!" });

    /**
     * !Checking If Data Is Added Or Not,If Data Added Than Return Error Free Response Else Return An Error ------------->
     */
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.getPackage = async (req, res) => {
  try {
    /**
     * Incoming ID
     */
    const { id } = req.params;

    /**
     * ?Retrieve Package From Database Against Incoming "ID" -------------->
     */
    const package_detail = await PackagesModel.findById(id);
    /**
     * !Retrieve Package From Database Against Incoming "ID" -------------->
     */

    return res.status(200).json(package_detail);
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.getPackages = async (req, res) => {
  try {
    /**
     * ?Retrieve All Packages From Database -------------->
     */
    const packages_detail = await PackagesModel.find();
    /**
     * !Retrieve All Packages From Database -------------->
     */

    return res.status(200).json(packages_detail);
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.updatePackage = async (req, res) => {
  try {
    /**
     * Incoming ID
     */
    const { id } = req.params;

    /**
     * Incoming Data
     */
    const { label, price, allowed_listings } = req.body;

    /**
     * ?Update Incoming Data To Database Against "ID" -------------->
     */
    const is_package_updated = await PackagesModel.findByIdAndUpdate(id, {
      label,
      allowed_listings,
      price,
    });
    /**
     * !Update Incoming Data To Database Against "ID" -------------->
     */

    /**
     * @return Returning Response To Request
     */
    return res.status(200).json({ error: false, msg: "Package Updated!" });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
