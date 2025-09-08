const express = require('express');
const router = express.Router();
const bugPhotoController = require('../controllers/BugPhotoController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const multer = require('multer');

// Setup multer untuk handle file upload
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Hanya file gambar yang diperbolehkan'));
    }
  }
});

router.use(authMiddleware);

// GET photos by bug report ID
router.get('/bug-report/:id_bug_report', 
  roleMiddleware('user_umum', 'pencatat', 'admin_sa', 'validator', 'teknisi', 'admin_kategori'),
  bugPhotoController.getPhotosByBugId
);

// UPLOAD photos for bug report
router.post('/bug-report/:id_bug_report', 
  roleMiddleware('user_umum', 'pencatat', 'admin_sa'),
  upload.array('photos', 5),
  bugPhotoController.uploadPhotos
);

// DELETE specific photo
router.delete('/:id_bug_photo',
  roleMiddleware('user_umum', 'pencatat', 'admin_sa'),
  bugPhotoController.deletePhoto
);

module.exports = router;