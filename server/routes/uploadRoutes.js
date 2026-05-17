const express = require('express');
const router = express.Router();
const { uploadFile, deleteFile } = require('../controllers/uploadController');
const { upload } = require('../config/cloudinary');
const auth = require('../middleware/auth');

router.post('/', auth, upload.single('file'), uploadFile);
router.delete('/:publicId', auth, deleteFile);

module.exports = router;
