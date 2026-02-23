const multer = require('multer');

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const ok = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.mimetype);
    if (!ok) return cb(new Error('Only JPG and PNG images are supported'));
    cb(null, true);
  },
});

module.exports = upload;
