const ReviewsModel = require("../models/ReviewsModel");
const PropertiesModel = require("../models/PropertiesModel");
const UsersModel = require("../models/UsersModel");
module.exports.addReview = async (req, res) => {
  try {
    /**
     * Incoming Property ID
     */
    const { id } = req.params;

    /**
     * Incoming Data
     */
    const { name, email, website, stars, msg } = req.body;

    /**
     * Adding Review To Database
     */
    const is_review_added = await ReviewsModel.create({
      name,
      email,
      website,
      stars,
      msg,
      property_id: id,
    });

    /**
     * Fetching 1 Star Ratings Of Property
     */
    const one_star = await ReviewsModel.find({
      property_id: id,
      stars: 1,
    }).count();
    /**
     * Fetching 2 Star Ratings Of Property
     */
    const two_star = await ReviewsModel.find({
      property_id: id,
      stars: 2,
    }).count();
    /**
     * Fetching 3 Star Ratings Of Property
     */
    const three_star = await ReviewsModel.find({
      property_id: id,
      stars: 3,
    }).count();
    /**
     * Fetching 4 Star Ratings Of Property
     */
    const four_star = await ReviewsModel.find({
      property_id: id,
      stars: 4,
    }).count();
    /**
     * Fetching 5 Star Ratings Of Property
     */
    const five_star = await ReviewsModel.find({
      property_id: id,
      stars: 5,
    }).count();

    /**
     * Property Average Rating
     */
    const float =
      (5 * five_star +
        4 * four_star +
        3 * three_star +
        2 * two_star +
        1 * one_star) /
      (five_star + four_star + three_star + two_star + one_star);
    /**
     * Converting Float To One Decimal Place
     */
    const property_average_rating = parseFloat(float).toFixed(1);

    /**
     * Fetching Property From "properties" Collection
     */
    const property_details = await PropertiesModel.findById(id);
    /**
     * Adding One To Current "property_total_reviews"
     */
    property_details.property_total_reviews =
      property_details.property_total_reviews + 1;
    property_details.property_average_rating = property_average_rating;
    property_details.save();

    /**
     * Fetch Seller All Properties
     */

    const seller_properties = await PropertiesModel.find({
      seller_id: property_details.seller_id,
    });

    /**
     * Combining All Properties Of Seller Stars
     */
    let seller_one_stars = 0;
    let seller_two_stars = 0;
    let seller_three_stars = 0;
    let seller_four_stars = 0;
    let seller_five_stars = 0;

    for (let i = 0; i < seller_properties.length; i++) {
      const property = seller_properties[i];

      /**
       * Fetching 1 Star Ratings Of Property
       */
      const one_star = await ReviewsModel.find({
        property_id: property._id,
        stars: 1,
      }).count();
      /**
       * Fetching 2 Star Ratings Of Property
       */
      const two_star = await ReviewsModel.find({
        property_id: property._id,
        stars: 2,
      }).count();
      /**
       * Fetching 3 Star Ratings Of Property
       */
      const three_star = await ReviewsModel.find({
        property_id: property._id,
        stars: 3,
      }).count();
      /**
       * Fetching 4 Star Ratings Of Property
       */
      const four_star = await ReviewsModel.find({
        property_id: property._id,
        stars: 4,
      }).count();
      /**
       * Fetching 5 Star Ratings Of Property
       */
      const five_star = await ReviewsModel.find({
        property_id: property._id,
        stars: 5,
      }).count();

      /**
       * Adding Each Property Stars To Respective Variables
       */
      seller_one_stars += one_star;
      seller_two_stars += two_star;
      seller_three_stars += three_star;
      seller_four_stars += four_star;
      seller_five_stars += five_star;
    }

    /**
     * Calculating Seller Average Rating By Dividing All Properties With Thier Stars (1,2,3,4,5) And Multiplying Them To Respective Stars Above
     */
    const seller_rating_float =
      (5 * seller_five_stars +
        4 * seller_four_stars +
        3 * seller_three_stars +
        2 * seller_two_stars +
        1 * seller_one_stars) /
      (seller_five_stars +
        seller_four_stars +
        seller_three_stars +
        seller_two_stars +
        seller_one_stars);
    const seller_average_rating = parseFloat(seller_rating_float).toFixed(1);

    /**
     * Fetching Seller From Database And Updating Him/Her
     */
    const seller_details = await UsersModel.findById(
      property_details.seller_id
    );
    seller_details.total_reviews = seller_details.total_reviews + 1;
    seller_details.rating = seller_average_rating;
    seller_details.save();

    return res.status(200).json({ error: false, msg: "Review Added!" });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.getSellerReviews = async (req, res) => {
  try {
    /**
     * Get Seller ID From "fetchUser" Middleware
     */
    const { user_id } = req;

    /**
     * Find All Properties Of Seller
     */
    const seller_properties = await PropertiesModel.find({
      seller_id: user_id,
    });

    let reviewsArray = [];

    for (let i = 0; i < seller_properties.length; i++) {
      const property = seller_properties[i];
      /**
       * Find Reviews Of Property
       */
      const property_reviews = await ReviewsModel.find({
        property_id: property._id,
      }).populate("property_id", "title");
      /**
       * Check If There Are More Than 0 Reviews Than Push It In reviewsArray Variable Else Continue
       */
      if (property_reviews.length > 0) {
        /**
         * Push Each Review To reviewsArray Variable So That An Object Will Be Pushed Instead Of Whole Array We Gotten From "property_reviews" result
         */
        property_reviews.forEach((review) => {
          reviewsArray.push(review);
        });
      }
    }

    /**
     * @return Reviews Found Against Each Property
     */
    return res.status(200).json(reviewsArray);
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
