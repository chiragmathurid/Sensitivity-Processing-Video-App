const multer  = require('multer');
const path    = require('path');
const crypto  = require('crypto');
const fs      = require('fs');

// Build the absolute path to the uploads folder
const uploadDir = path.join(__dirname, '..', '..', 'uploads');

// Create the folder if it doesn't exist — no error if it already exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('Created uploads directory at:', uploadDir);
}

console.log('Multer upload directory:', uploadDir); // ← verify the path on startup

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // use the absolute path variable
  },

  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'video/mp4',
    'video/mpeg',
    'video/quicktime',
    'video/x-msvideo',
    'video/webm',
    'video/x-matroska',
    'application/octet-stream'
  ];

  const allowedExtensions = ['.mp4', '.mov', '.avi', '.webm', '.mkv', '.mpeg'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, mov, avi, webm, mkv)'), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 }
});

module.exports = upload;