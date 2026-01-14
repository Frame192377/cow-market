// backend/src/controllers/adminController.js
const { User, Cow, Product, Order } = require("../models");

// ดูสถิติรวม
exports.getStats = async (req, res) => {
  try {
    const users = await User.count();
    const cows = await Cow.count();
    const products = await Product.count();
    const orders = await Order.count();
    res.json({ users, cows, products, orders });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ดึงสมาชิกทั้งหมด
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: { exclude: ['password'] },
      order: [['createdAt', 'DESC']]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ดึงคำสั่งซื้อทั้งหมด
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      include: [
        { model: User, as: 'Buyer', attributes: ['name', 'email'] },
        { model: User, as: 'Seller', attributes: ['name', 'phoneNumber'] },
        { model: Product, as: 'Product', attributes: ['name', 'price'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ดึงข้อมูลวัวทั้งหมด (Admin เห็นทุกตัว รวมถึง Pending)
exports.getAllCows = async (req, res) => {
  try {
    const cows = await Cow.findAll({
      include: [{ model: User, as: 'User', attributes: ['name', 'phoneNumber'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(cows);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ดึงสินค้าทั้งหมด (Admin เห็นทุกตัว รวมถึง Pending)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.findAll({
      include: [{ model: User, as: 'User', attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(products);
  } catch (err) { res.status(500).json({ error: err.message }); }
};

// ✅✅✅ ฟังก์ชันเปลี่ยนสถานะ (อนุมัติ / ปฏิเสธ)
exports.updateItemStatus = async (req, res) => {
  try {
    const { type, id } = req.params; // type: 'cow' หรือ 'product'
    const { status } = req.body; // ส่งมาเป็น 'approved' หรือ 'rejected'

    let item;
    if (type === 'cow') {
        item = await Cow.findByPk(id);
    } else if (type === 'product') {
        item = await Product.findByPk(id);
    } else {
        return res.status(400).json({ error: "Invalid type" });
    }

    if (!item) return res.status(404).json({ error: "Item not found" });

    // อัปเดตสถานะ
    item.status = status;
    await item.save();

    res.json({ message: `Status updated to ${status}`, item });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Update status failed" });
  }
};

// ลบรายการ
exports.deleteItem = async (req, res) => {
  try {
    const { type, id } = req.params;
    
    if (type === 'cow') {
        await Cow.destroy({ where: { id } });
    } else if (type === 'product') {
        await Product.destroy({ where: { id } });
    } else {
        return res.status(400).json({ error: "Invalid type" });
    }

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
};