const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
module.exports.uploadPicture = async (file, folder) => {
  try {
    const response = await cloudinary.uploader.upload(file, {
      upload_preset: process.env.CLOUDINARY_PRESET,
      folder,
    });
    return response.url;
  } catch (error) {
    return error.message;
  }
};
