const mongoose = require("mongoose");
const mongoosePaginate = require("mongoose-paginate-v2");
const PropertiesModel = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    after_price_label: {
      type: String,
      default: "",
    },
    before_price_label: {
      type: String,
      default: "",
    },
    area: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    listing_media: {
      type: Array,
      required: true,
    },
    property_address: {
      address: {
        type: String,
        required: true,
      },
      lat: {
        type: Number,
        required: true,
      },
      lng: {
        type: Number,
        required: true,
      },
    },
    property_size: {
      type: Number,
      required: true,
    },
    property_lot_size: {
      type: Number,
      required: true,
    },
    property_rooms: {
      type: Number,
      required: true,
    },
    property_bed_rooms: {
      type: Number,
      required: true,
    },
    property_bath_rooms: {
      type: Number,
      required: true,
    },
    property_garages: {
      type: Number,
      required: true,
    },
    property_year_built: {
      type: Number,
      required: true,
    },
    property_garages_size: {
      type: Number,
      required: true,
    },
    property_amenities: {
      type: Array,
      required: true,
    },
    property_total_reviews: {
      type: Number,
      default: 0,
    },
    property_average_rating: {
      type: Number,
      default: 0,
    },
    property_floors: {
      type: [
        {
          floor_media: {
            type: String,
            required: true,
          },
          floor_heading: {
            type: String,
            required: true,
          },
          floor_description: {
            type: String,
            required: true,
          },
        },
      ],
      required: true,
    },
    seller_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "users",
    },
  },
  { timestamps: true }
);
PropertiesModel.plugin(mongoosePaginate);
module.exports = mongoose.model("properties", PropertiesModel);
