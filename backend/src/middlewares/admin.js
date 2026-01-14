const { User } = require("../models");

exports.adminCheck = async (req, res, next) => {
  try {
    // req.user มาจาก auth middleware ตัวก่อนหน้า
    const user = await User.findByPk(req.user.id);
    
    if (user.role !== 'admin') {
      return res.status(403).json({ error: "Access Denied: Admin only" });
    }
    
    next();
  } catch (err) {
    res.status(500).json({ error: "Admin Check Error" });
  }
};