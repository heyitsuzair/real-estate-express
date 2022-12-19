const mongoose = require("mongoose");
const ResetPasswordModel = new mongoose.Schema({
  token: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
});
module.exports = mongoose.model("reset-password", ResetPasswordModel);
