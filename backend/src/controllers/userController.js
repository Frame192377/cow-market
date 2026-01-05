const { User } = require("../models");

// GET /api/users/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "name", "email", "phone", "avatar", "address", "role"]
    });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    console.error("GET ME ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};

// PUT /api/users/me
exports.updateMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const { name, phone, address } = req.body;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (address) user.address = address;

    // ถ้ามีอัปโหลดรูปมา
    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      role: user.role,
    });
  } catch (err) {
    console.error("UPDATE ME ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};
