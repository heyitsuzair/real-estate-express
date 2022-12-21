const { uploadPicture } = require("../utils/uploadPicture");
const UsersModel = require("../models/UsersModel");
const ReviewsModel = require("../models/ReviewsModel");
const PropertiesModel = require("../models/PropertiesModel");
const { deletePicture } = require("../utils/deletePicture");

module.exports.addProperty = async (req, res) => {
  try {
    /**
     * Incoming Data
     */
    const {
      title,
      description,
      price,
      after_price_label,
      before_price_label,
      area,
      status,
      type,
      property_address,
      property_size,
      property_lot_size,
      property_rooms,
      property_bed_rooms,
      property_bath_rooms,
      property_garages,
      property_year_built,
      property_garages_size,
      property_amenities,
      property_floors,
      listing_media,
    } = req.body;

    /**
     * Get Seller ID From "fetchUser" Middleware
     */
    const { user_id } = req;

    /**
     * Fetch User Info From "users" collection
     */

    const user_details = await UsersModel.findById(user_id).select("-password");

    /**
     * Check If User's Package Is Finished And His/Her Remaining Listing Is 0 Than Return An Error
     */
    if (user_details.remaining_listings < 1) {
      return res.status(400).json({
        error: true,
        msg: "Please Upgrade Your Package To Add More Listings",
      });
    }

    /**
     * Listing Media Array That Will Be Pushed Every Time An Image Is Uploaded Using for loop "listing_media" variable containing base64 images array
     */
    const listing_media_array = [];

    /**
     * Uploading Each Listing Media To Cloudinary And Pushing Response URL To "listing_media_array" variable
     */
    for (let i = 0; i < listing_media.length; i++) {
      const media = listing_media[i];

      const listing_media_url = await uploadPicture(
        media,
        "/real-estate-menn/listings/address-" + property_address
      );
      listing_media_array.push(listing_media_url);
    }

    /**
     * Property Floors Array That Will Be Pushed Every Time An Image Is Uploaded Using for loop "property_floors" variable containing each floor base64 image,floor heading, floor description
     */
    const property_floors_array = [];

    /**
     * Uploading Each Floor Plan Media Media To Cloudinary And Pushing Response URL,Floor Heading And Description To "property_floors_array" variable
     */
    for (let i = 0; i < property_floors.length; i++) {
      const floor = property_floors[i];

      const floor_media_url = await uploadPicture(
        floor.floor_media,
        "/real-estate-menn/floor_plans/address-" + property_address
      );
      property_floors_array.push({
        floor_media: floor_media_url,
        floor_heading: floor.floor_heading,
        floor_description: floor.floor_description,
      });
    }

    /**
     * ?Adding Data To Collection ------------------->
     */

    const is_property_added = await PropertiesModel.create({
      title,
      description,
      price,
      after_price_label,
      before_price_label,
      area,
      status,
      type,
      property_address,
      property_size,
      property_lot_size,
      property_rooms,
      property_bed_rooms,
      property_bath_rooms,
      property_garages,
      property_year_built,
      property_garages_size,
      property_amenities,
      listing_media: listing_media_array,
      property_floors: property_floors_array,
      seller_id: user_id,
    });

    /**
     * !Adding Data To Collection ------------------->
     */

    /**
     * Subtracting One From Seller Remaining Listings
     */
    const minus_one_listing = await UsersModel.findByIdAndUpdate(user_id, {
      remaining_listings: user_details.remaining_listings - 1,
    });

    /**
     * @return A Positive Response Back To Request
     */
    return res.status(200).json({ error: false, msg: "Property Added" });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.deleteProperty = async (req, res) => {
  try {
    /**
     * Incoming Property ID
     */
    const { id } = req.params;

    /**
     * Getting Property Details
     */
    const property_details = await PropertiesModel.findById(id);

    if (!property_details) {
      return res.status(400).json({ error: true, msg: "Property Not Found!" });
    }

    /**
     * Deleting Listing Media Of Property That Was Uploaded To Cloudinary At The Time Of Adding Property
     */
    for (let i = 0; i < property_details.listing_media.length; i++) {
      const media = property_details.listing_media[i];
      /**
       * Removing Forward Slashes From URL And Combining Strings To Make Path To Delete Image On Cloudinary
       */
      const removeForwardSlashes = media.split("/");
      const path =
        removeForwardSlashes[7] +
        "/" +
        removeForwardSlashes[8] +
        "/" +
        removeForwardSlashes[9] +
        "/" +
        removeForwardSlashes[10].split(".")[0];
      const pathWithoutPercent20 = decodeURIComponent(path);
      const response = await deletePicture(pathWithoutPercent20);
    }

    /**
     * Deleting Floor Plans Media Media Of Property That Was Uploaded To Cloudinary At The Time Of Adding Property
     */
    for (let i = 0; i < property_details.property_floors.length; i++) {
      const media = property_details.property_floors[i].floor_media;
      /**
       * Removing Forward Slashes From URL And Combining Strings To Make Path To Delete Image On Cloudinary
       */
      const removeForwardSlashes = media.split("/");
      const path =
        removeForwardSlashes[7] +
        "/" +
        removeForwardSlashes[8] +
        "/" +
        removeForwardSlashes[9] +
        "/" +
        removeForwardSlashes[10].split(".")[0];
      const pathWithoutPercent20 = decodeURIComponent(path);
      const response = await deletePicture(pathWithoutPercent20);
    }

    /**
     * After Deleting Media Now Deleting Document In Collection
     */
    const is_property_deleted = await PropertiesModel.findByIdAndDelete(id);

    /**
     * @return A Positive Response
     */
    return res.status(200).json({ error: false, msg: "Property Deleted!" });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.getProperty = async (req, res) => {
  try {
    /**
     * Incoming Property ID
     */
    const { id } = req.params;

    /**
     * Fetching Property Document From Collection
     */
    const property_details = await PropertiesModel.findById(id).populate(
      "seller_id",
      "-password"
    );

    /**
     * Fetching Property Reviews From Collection
     */
    const property_reviews = await ReviewsModel.find({
      property_id: id,
    }).select("-email");

    return res
      .status(200)
      .json({ property: property_details, reviews: property_reviews });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.getProperties = async (req, res) => {
  try {
    /**
     * Incoming Page No
     */

    const { page_no, limit } = req.params;

    const options = {
      page: page_no,
      limit: limit,
      populate: [
        {
          path: "seller_id",
          select: ["-password", "-remaining_listings", "-package"],
        },
      ],
    };

    /**
     * Fetching Documents From Collection With Paginate Function
     */
    const properties = await PropertiesModel.paginate({}, options);

    return res.status(200).json(properties);
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.getSellerProperties = async (req, res) => {
  try {
    /**
     * Get Seller ID From "fetchUser" Middleware
     */
    const { user_id } = req;

    /**
     * Fetching Properties Of Seller
     */
    const properties = await PropertiesModel.find({ seller_id: user_id });
    return res.status(200).json(properties);
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.updateProperty = async (req, res) => {
  try {
    /**
     * Incoming Property ID
     */

    const { id } = req.params;

    /**
     * Incoming Data
     */
    const {
      title,
      description,
      price,
      after_price_label,
      before_price_label,
      area,
      status,
      type,
      property_address,
      property_size,
      property_lot_size,
      property_rooms,
      property_bed_rooms,
      property_bath_rooms,
      property_garages,
      property_year_built,
      property_garages_size,
      property_amenities,
      property_floors,
      listing_media,
    } = req.body;

    /**
     * Property Details
     */
    const property_details = await PropertiesModel.findById(id);

    if (!property_details) {
      return res.status(400).json({ error: true, msg: "Property Not Found!" });
    }

    /**
     * Listing Media Array That Will Be Pushed Every Time An Image Is Uploaded Using for loop "listing_media" variable containing base64 images array
     */
    let listing_media_array = [];

    /**
     * ?If Listing Media Array Is Empty Than Prevent Uploading Images And Push Old Images Back To "listing_media_array" variable
     */
    for (let i = 0; i < listing_media.length; i++) {
      const media = listing_media[i];

      if (media === property_details.listing_media[i]) {
        /**
         * Assigning Listing Media Array To The Old Array
         */
        listing_media_array = property_details.listing_media;
      } else {
        /**
         * Deleting Listing Media Of Property That Was Uploaded Last Time The Property Updated
         */
        for (let i = 0; i < property_details.listing_media.length; i++) {
          const media = property_details.listing_media[i];
          /**
           * Removing Forward Slashes From URL And Combining Strings To Make Path To Delete Image On Cloudinary
           */
          const removeForwardSlashes = media.split("/");
          const path =
            removeForwardSlashes[7] +
            "/" +
            removeForwardSlashes[8] +
            "/" +
            removeForwardSlashes[9] +
            "/" +
            removeForwardSlashes[10].split(".")[0];

          const pathWithoutPercent20 = decodeURIComponent(path);

          const response = await deletePicture(pathWithoutPercent20);
        }

        /**
         * Uploading Each Listing Media To Cloudinary And Pushing Response URL To "listing_media_array" variable
         */

        const listing_media_url = await uploadPicture(
          media,
          "/real-estate-menn/listings/address-" + property_address
        );
        listing_media_array.push(listing_media_url);
      }
    }
    /**
     * Property Floors Array That Will Be Pushed Every Time An Image Is Uploaded Using for loop "property_floors" variable containing each floor base64 image,floor heading, floor description
     */
    const property_floors_array = [];

    /**
     * Uploading Each Floor Plan Media Media To Cloudinary And Pushing Response URL,Floor Heading And Description To "property_floors_array" variable
     */
    for (let i = 0; i < property_floors.length; i++) {
      const floor = property_floors[i];
      /**
       * Check If Floor Is Not Undefined, Mean If It Is Already Added (Already In Database) Or The User Added Another Floor While Updating
       */
      if (
        property_details.property_floors[i] !== undefined &&
        property_details.property_floors[i].floor_media === floor.floor_media
      ) {
        property_floors_array.push({
          floor_media: floor.floor_media,
          floor_heading: floor.floor_heading,
          floor_description: floor.floor_description,
        });
      } else {
        const floor_media_url = await uploadPicture(
          floor.floor_media,
          "/real-estate-menn/floor_plans/address-" + property_address
        );
        property_floors_array.push({
          floor_media: floor_media_url,
          floor_heading: floor.floor_heading,
          floor_description: floor.floor_description,
        });
      }
    }

    /**
     * ?Updating Data To Collection ------------------->
     */

    const is_property_updated = await PropertiesModel.findByIdAndUpdate(id, {
      title,
      description,
      price,
      after_price_label,
      before_price_label,
      area,
      status,
      type,
      property_address,
      property_size,
      property_lot_size,
      property_rooms,
      property_bed_rooms,
      property_bath_rooms,
      property_garages,
      property_year_built,
      property_garages_size,
      property_amenities,
      listing_media: listing_media_array,
      property_floors: property_floors_array,
    });

    /**
     * !Updating Data To Collection ------------------->
     */

    /**
     * @return A Positive Response Back To Request
     */
    return res.status(200).json({
      error: false,
      msg: "Property Updated",
      property: {
        title,
        description,
        price,
        after_price_label,
        before_price_label,
        area,
        status,
        type,
        property_address,
        property_size,
        property_lot_size,
        property_rooms,
        property_bed_rooms,
        property_bath_rooms,
        property_garages,
        property_year_built,
        property_garages_size,
        property_amenities,
        listing_media: listing_media_array,
        property_floors: property_floors_array,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.searchProperties = async (req, res) => {
  try {
    /**
     * Incoming Page No, Limit, Query
     */
    const { query, limit, pageNo } = req.params;

    const options = {
      page: pageNo,
      limit: limit,
      populate: [
        {
          path: "seller_id",
          select: ["-password", "-remaining_listings", "-package"],
        },
      ],
    };

    /**
     * Search By Title
     */
    const toFind = {
      title: { $regex: new RegExp("^" + query.toLowerCase(), "i") },
    };

    const foundProperties = await PropertiesModel.paginate(toFind, options);

    return res.status(200).json(foundProperties);
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.filterProperties = async (req, res) => {
  try {
    /**
     * Incoming Page No, Limit, Query
     */
    const { limit, pageNo } = req.params;
    /**
     * Incoming Status,Area,Type To Search
     */
    const { status, area, type } = req.params;

    const options = {
      page: pageNo,
      limit: limit,
      populate: [
        {
          path: "seller_id",
          select: ["-password", "-remaining_listings", "-package"],
        },
      ],
    };

    /**
     * Search By Status, Type,Area
     */
    const toFind = {
      status: { $regex: status },
      type: { $regex: type },
      area: { $regex: area },
    };

    const foundProperties = await PropertiesModel.paginate(toFind, options);

    return res.status(200).json(foundProperties);
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
