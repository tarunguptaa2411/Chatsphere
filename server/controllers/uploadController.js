const { cloudinary } = require('../config/cloudinary');

// @desc    Upload a file to Cloudinary
// @route   POST /api/upload
exports.uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    res.json({
      url: req.file.path,
      publicId: req.file.filename,
      originalName: req.file.originalname,
      format: req.file.format || req.file.originalname.split('.').pop(),
      size: req.file.size,
    });
  } catch (error) {
    res.status(500).json({ message: 'File upload failed.' });
  }
};

// @desc    Delete a file from Cloudinary
// @route   DELETE /api/upload/:publicId
exports.deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    await cloudinary.uploader.destroy(publicId);
    res.json({ message: 'File deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete file.' });
  }
};
