const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth");
const userController = require("../controllers/userController");
const multer = require("multer");
const path = require("path");

// เก็บรูปโปรไฟล์ไว้ใน /uploads/avatars
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "..", "uploads", "avatars"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const upload = multer({ storage });

router.get("/me", authenticate, userController.getMe);

router.put(
  "/me",
  authenticate,
  upload.single("avatar"), // field name = avatar
  userController.updateMe
);

module.exports = router;
