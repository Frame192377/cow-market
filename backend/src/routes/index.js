const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const cowController = require('../controllers/cowController');
const { authenticate } = require('../middlewares/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname.replace(/\s+/g,'_'))
});
const upload = multer({ storage });

router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);

router.get('/cows', cowController.listCows);
router.post('/cows', authenticate, upload.array('images', 6), cowController.createCow);

module.exports = router;
