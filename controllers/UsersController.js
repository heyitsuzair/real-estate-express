var bcrypt = require("bcryptjs");
const UsersModel = require("../models/UsersModel");
const PackageModel = require("../models/PackagesModel");
const { sendEmail } = require("../utils/mail");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const ResetPasswordModel = require("../models/ResetPasswordModel");
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

module.exports.addUser = async (req, res) => {
  try {
    /**
     * Incoming Data
     */
    const {
      name,
      email,
      password,
      phone_no,
      package,
      rating,
      total_reviews,
      card_no,
      card_cvc,
      expiry_year,
      expiry_month,
    } = req.body;

    /**
     * ?Check If Email Is Already In Database Or Not ------------>
     */

    const does_email_exist = await UsersModel.findOne({ email });

    if (does_email_exist) {
      return res
        .status(400)
        .json({ error: true, msg: "Sorry! Email Already Exists" });
    }

    /**
     * !Check If Email Is Already In Database Or Not ------------>
     */

    /**
     * ?Retrieve Package Price Against "ID" ------------>
     */

    const package_detail = await PackageModel.findById(package);
    /**
     * !Retrieve Package Price Against "ID" ------------>
     */

    /**
     * ?Validate Card And Generate Token ------------>
     */

    const token = await stripe.tokens.create({
      card: {
        number: card_no,
        exp_month: expiry_month,
        exp_year: expiry_year,
        cvc: card_cvc,
      },
    });
    /**
     * !Validate Card And Generate Token ------------>
     */

    /**
     * ?Charge Card ------------>
     */

    const charge = await stripe.charges.create({
      amount: package_detail.price * 100,
      currency: "pkr",
      source: token.id,
      description: "A Charge From Seller On Registration On Real-Estate-MENN",
    });

    /**
     * !Charge Card ------------>
     */

    /**
     * ?Add User To Database If He/She Have Been Charged Successfully ---------------->
     */
    if (charge.paid) {
      /**
       * Hash Password
       */
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const is_user_added = await UsersModel.create({
        name,
        email,
        package,
        password: hash,
        phone_no,
        remaining_listings: package_detail.allowed_listings,
        rating,
        total_reviews,
      });

      if (is_user_added) {
        sendEmail(
          email,
          "Registration Successful",
          `<div>Congratulations! You Have Successfully Registered Yourself On Real Estate And We Have Added ${
            package_detail.label
          } Package To Your Account! You Can <a href="${
            process.env.HOST || "http://localhost:3000"
          }/login">Login</a> And Upgrade Package In Your Dashboard Whenever You Want. Receipt Of Payment ${
            charge.receipt_url
          } </div>`
        );

        return res
          .status(200)
          .json({ error: false, msg: "Registration Successful!" });
      } else {
        return res.status(400).json({
          error: true,
          msg: "Something Went Wrong!",
        });
      }
    }
    /**
     * !Add User To Database If He/She Have Been Charged Successfully ---------------->
     */
    return res.status(400).json({
      error: true,
      msg: "Something Went Wrong! Please Contact Your Card Provider",
    });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.recoverEmail = async (req, res) => {
  try {
    /**
     * Incoming Email
     */

    const { email } = req.params;

    /**
     * ?Check If Email Exists Or Not ------------->
     */
    const does_email_exist = await UsersModel.findOne({ email });

    /**
     * ?Check If Email Exists Or Not ------------->
     */

    if (does_email_exist) {
      /**
       * ?Generate Random Bytes ------------>
       */
      const randomBytes = crypto.randomBytes(50).toString("hex");
      /**
       * !Generate Random Bytes ------------>
       */

      /**
       * ?Generate JWT ------------>
       */
      const token = jwt.sign(
        {
          bytes: randomBytes,
        },
        process.env.JWT_SECRET
      );

      /**
       * !Generate JWT ------------>
       */

      /**
       * ?Check If User Request To Recover Account Already Exist In Collection, If Yes Than Simply Update Token Else Add Request
       */
      const does_user_already_requested = await ResetPasswordModel.findOne({
        email,
      });

      if (does_user_already_requested) {
        const update_token = await ResetPasswordModel.findOneAndUpdate(
          { email },
          {
            token,
          }
        );

        sendEmail(
          email,
          "Reset Password Link",
          `<div>
          Please Visit The <a href="${
            process.env.HOST || "http://localhost:3000"
          }/new_password?email=${email}&token=${token}">Link</a> To Reset Password </div>`
        );

        return res.status(200).json({
          error: false,
          msg: "An Email With Link Has Been Sent To Your Provided Email",
        });
      } else {
        const add_request = await ResetPasswordModel.create({ email, token });
        sendEmail(
          email,
          "Reset Password Link",
          `<div>
          Please Visit The <a href="${
            process.env.HOST || "http://localhost:3000"
          }/new_password?email=${email}&token=${token}">Link</a> To Reset Password </div>`
        );

        return res.status(200).json({
          error: false,
          msg: "Link Has Been Sent To Your Provided Email",
        });
      }
      /**
       * !Check If User Request To Recover Account Already Exist In Collection, If Yes Than Simply Update Token Else Add Request
       */
    }
    return res
      .status(400)
      .json({ error: true, msg: "Sorry! You Are Not Registered With Us" });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.resetPassword = async (req, res) => {
  try {
    /**
     * Incoming Token And Email
     */
    const { email, token } = req.params;

    /**
     * Incoming New Password
     */

    const { password } = req.body;

    /**
     * ?Check That Email And Token Does Exist In Reset Passwords Collection------------>
     */

    const does_request_exist = await ResetPasswordModel.findOne({
      email,
      token,
    });

    /**
     * !Check That Email And Token Does Exist In Reset Passwords Collection------------>
     */

    /**
     * ?If Request To Recover Email Exist In Collection Than Update Password Else Return An Error ---------------->
     */

    if (does_request_exist) {
      /**
       * Verify JWT
       */

      const verify_jwt = jwt.verify(
        does_request_exist.token,
        process.env.JWT_SECRET
      );

      if (verify_jwt) {
        /**
         * Hash Password
         */
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);

        /**
         * Update User Passord
         */
        const is_password_updated = await UsersModel.findOneAndUpdate(
          { email },
          {
            password: hash,
          }
        );

        /**
         * Revoke Token -------------->
         */

        const revoke_token = await ResetPasswordModel.findOneAndDelete({
          email,
          token,
        });

        sendEmail(
          email,
          "Password Changed",
          `<div>Your Password For Real Estate By UZAIR Has Been Changed Successfully! You Can Now <a href='${
            process.env.HOST || "http://localhost:3000"
          }/login'>Login</a></div>`
        );

        return res
          .status(200)
          .json({ error: false, msg: "Password Has Been Changed" });
      } else {
        return res
          .status(400)
          .json({ error: false, msg: "Something Went Wrong!" });
      }
    }

    /**
     * !If Request To Recover Email Exist In Collection Than Update Password Else Return An Error ---------------->
     */
    return res.status(400).json({ error: true, msg: "Request Doesn't Exist" });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.loginUser = async (req, res) => {
  try {
    /**
     * Incoming Email And Password
     */
    const { email, password } = req.body;

    /**
     * Find User Against Email
     */
    let user = await UsersModel.findOne({ email });

    /**
     * @return Return An Error If Password Or Email Is Invalid
     */
    if (!user) {
      return res.status(200).json({ error: true, msg: "Invalid Credentials!" });
    }
    /**
     * Compare Password
     */
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res.status(200).json({ error: true, msg: "Invalid Credentials!" });
    }
    /**
     * Generating JWT And Sending To Request
     */
    const data = {
      user_id: user.id,
    };

    const token = jwt.sign(data, process.env.JWT_SECRET);

    /**
     * @return Return A Token To Request With Logged In User "ID" In Token
     */
    return res.status(200).json({ error: false, token });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.getUserProfile = async (req, res) => {
  try {
    /**
     * Get User ID From "fetchUser" Middleware
     */
    const { user_id } = req;

    /**
     * Find User Profile From Users Collection
     */
    const user_profile = await UsersModel.findById(user_id)
      .select("-password")
      .populate("package");

    return res.status(200).json(user_profile);
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.updateUserProfile = async (req, res) => {
  try {
    /**
     * Incoming Data
     */
    const { name, phone_no, email, password } = req.body;

    /**
     * Get User ID From "fetchUser" Middleware
     */
    const { user_id } = req;

    /**
     * ?Check If The Email Is Requested To Change Or Not By Matching Already Available Email Against User "ID" And Incoming Email
     */
    const is_email_change = await UsersModel.findById(user_id);

    if (is_email_change.email === email) {
      /**
       * ?Update Profile And Don't Change Password If It Is Empty String ------------->
       */
      if (!password) {
        const is_user_updated = await UsersModel.findByIdAndUpdate(user_id, {
          name,
          phone_no,
          email,
        });

        return res.status(200).json({ error: false, msg: "Profile Updated" });
      }
      /**
       * Hash Password
       */
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const is_user_updated = await UsersModel.findByIdAndUpdate(user_id, {
        name,
        phone_no,
        email,
        password: hash,
      });

      /**
       * !Update Profile And Don't Change Password If It Is Empty String ------------->
       */
      return res.status(200).json({ error: false, msg: "Profile Updated" });
    } else {
      /**
       * ?Check If Email Is Already In Database Or Not ------------>
       */

      const does_email_exist = await UsersModel.findOne({ email });

      if (does_email_exist) {
        return res
          .status(400)
          .json({ error: true, msg: "Sorry! Email Already Exists" });
      }

      /**
       * !Check If Email Is Already In Database Or Not ------------>
       */

      /**
       * ?Update Profile And Don't Change Password If It Is Empty String ------------->
       */
      if (!password) {
        const is_user_updated = await UsersModel.findByIdAndUpdate(user_id, {
          name,
          phone_no,
          email,
        });

        return res.status(200).json({ error: false, msg: "Profile Updated" });
      }

      /**
       * Hash Password
       */
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const is_user_updated = await UsersModel.findByIdAndUpdate(user_id, {
        name,
        phone_no,
        email,
        password: hash,
      });

      /**
       * !Update Profile And Don't Change Password If It Is Empty String ------------->
       */
      return res.status(200).json({ error: false, msg: "Profile Updated" });
    }
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
module.exports.updateUserPackage = async (req, res) => {
  try {
    /**
     * Incoming Package To Update
     */
    const { package } = req.params;

    /**
     * Get User ID From "fetchUser" Middleware
     */
    const { user_id } = req;

    /**
     * Card Details
     */
    const { card_no, card_cvc, expiry_month, expiry_year } = req.body;

    /**
     * ?Retrieve Package Price Against "ID" ------------>
     */

    const package_detail = await PackageModel.findById(package);
    /**
     * !Retrieve Package Price Against "ID" ------------>
     */

    /**
     * ?Validate Card And Generate Token ------------>
     */

    const token = await stripe.tokens.create({
      card: {
        number: card_no,
        exp_month: expiry_month,
        exp_year: expiry_year,
        cvc: card_cvc,
      },
    });
    /**
     * !Validate Card And Generate Token ------------>
     */

    /**
     * ?Charge Card ------------>
     */

    const charge = await stripe.charges.create({
      amount: package_detail.price * 100,
      currency: "pkr",
      source: token.id,
      description:
        "A Charge From Seller On Updating Package On Real-Estate-MENN",
    });

    /**
     * !Charge Card ------------>
     */

    /**
     * ?Update User Package If He/She Have Been Charged Successfully ---------------->
     */
    if (charge.paid) {
      /**
       * Fetch User From "users" Collection
       */
      const user_details = await UsersModel.findById(user_id);

      /**
       * Calculate New Allowed Listings By Adding The Remaining Listings Of User With The Allowed Listings From Package With User Just Bought
       */
      const new_allowed_listings = parseInt(
        user_details.remaining_listings + package_detail.allowed_listings
      );

      const update_remaining_listings = await UsersModel.findByIdAndUpdate(
        user_id,
        {
          remaining_listings: new_allowed_listings,
        }
      );

      if (update_remaining_listings) {
        sendEmail(
          user_details.email,
          "Package Updated",
          `<div>We Have Successfully Updated Your Package. Your Remaining Listings Are Now ${new_allowed_listings}</div>`
        );
        return res.status(200).json({
          error: false,
          msg: "Package Updated!",
        });
      }
    }
    /**
     * !Update User Package If He/She Have Been Charged Successfully ---------------->
     */
    return res.status(400).json({
      error: true,
      msg: "Something Went Wrong! Please Contact Your Card Provider",
    });
  } catch (error) {
    return res.status(500).json({ error: true, msg: error.message });
  }
};
