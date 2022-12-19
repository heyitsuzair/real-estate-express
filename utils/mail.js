const nodemailer = require("nodemailer");
module.exports.sendEmail = async (email, subject, html) => {
  // Sending Email ------------------->
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: process.env.AUTH_NODEMAILER_USER,
      pass: process.env.AUTH_NODEMAILER_PASSWORD,
      clientId: process.env.OAUTH_CLIENT_ID,
      clientSecret: process.env.OAUTH_CLIENT_SECRET,
      refreshToken: process.env.OAUTH_REFRESH_TOKEN,
      accessToken: process.env.OAUTH_ACCESS_TOKEN,
    },
  });
  var mailOptions = {
    from: "Real Estate " + process.env.AUTH_NODEMAILER_USER,
    to: email,
    subject,
    html,
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error.message);
    }
  });
  // Sending Email ------------------->
};
