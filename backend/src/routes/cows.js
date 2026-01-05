// backend/src/routes/cows.js
const express = require('express');
const router = express.Router();
const cowController = require('../controllers/cowController');
const { authenticate } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g, '_')),
});
const upload = multer({ storage });

// GET /api/cows
router.get('/', cowController.listCows);

// GET /api/cows/:id
router.get('/:id', cowController.getCowById);

// POST /api/cows
router.post('/', authenticate, upload.array('images', 6), cowController.createCow);

// PUT /api/cows/:id  ✅ ให้รองรับอัปโหลดรูปใหม่ด้วย
router.put(
  '/:id',
  authenticate,
  upload.array('images', 6),
  cowController.updateCow
);
router.put('/:id/sold', authenticate, cowController.markAsSold);
// DELETE /api/cows/:id
router.delete('/:id', authenticate, cowController.deleteCow);

module.exports = router;
