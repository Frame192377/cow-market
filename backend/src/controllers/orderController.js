// backend/src/controllers/orderController.js

// ✅✅✅ แก้ไขบรรทัดนี้: เพิ่ม Review เข้ามา
const { Order, Product, User, Review } = require("../models");

// 1. สร้างคำสั่งซื้อ (Buyer สั่งของ)
exports.createOrder = async (req, res) => {
  try {
    const { 
      productId, 
      sellerId, 
      customerName, 
      phoneNumber, 
      address, 
      paymentMethod, 
      totalPrice, 
      quantity, 
      shippingCost 
    } = req.body;
    
    let slipImage = null;
    if (req.file) {
      slipImage = `/uploads/${req.file.filename}`;
    }

    // ตรวจสอบสินค้า
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "ไม่พบสินค้า" });
    }

    // เช็คสต็อก
    const buyQty = parseInt(quantity) || 1;
    if (product.stock < buyQty) {
      return res.status(400).json({ error: "สินค้ามีจำนวนไม่พอจำหน่าย" });
    }

    // ตัดสต็อก
    await product.decrement('stock', { by: buyQty });

    // บันทึกออเดอร์
    const newOrder = await Order.create({
      buyerId: req.user.id,
      sellerId,
      productId,
      customerName,
      phoneNumber,
      address,
      paymentMethod,
      slipImage,
      totalPrice,
      quantity: buyQty,
      shippingCost: shippingCost || 0,
      status: paymentMethod === 'transfer' ? 'pending' : 'pending' 
    });

    res.status(201).json({ message: "สั่งซื้อสำเร็จ", order: newOrder });

  } catch (err) {
    console.error("Create Order Error:", err);
    res.status(500).json({ error: "สั่งซื้อล้มเหลว" });
  }
};

// 2. ดึงคำสั่งซื้อสำหรับผู้ขาย (Seller ดูว่าใครมาซื้อ)
exports.getSellerOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { sellerId: req.user.id }, 
      include: [
        { model: Product, as: 'Product', attributes: ['name', 'images', 'price'] },
        { model: User, as: 'Buyer', attributes: ['name', 'avatar'] }
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ดึงข้อมูลไม่สำเร็จ" });
  }
};

// 3. ดึงประวัติการสั่งซื้อของผู้ซื้อ (Buyer ดูว่าตัวเองสั่งอะไรไปบ้าง)
exports.getBuyerOrders = async (req, res) => {
  try {
    const orders = await Order.findAll({
      where: { buyerId: req.user.id }, // หาออเดอร์ที่ฉันเป็นคนซื้อ
      include: [
        { model: Product, as: 'Product', attributes: ['name', 'images', 'price'] },
        { model: User, as: 'Seller', attributes: ['name', 'phoneNumber', 'line'] },
        // ✅ เช็คว่ามีรีวิวหรือยัง (ต้องมี Model Review ด้านบนถึงจะทำงาน)
        { model: Review, as: 'Review', attributes: ['id', 'rating'] } 
      ],
      order: [['createdAt', 'DESC']]
    });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "ดึงข้อมูลไม่สำเร็จ" });
  }
};

// 4. อัปเดตสถานะออเดอร์ (Seller กดเปลี่ยนสถานะ)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body; 

    const order = await Order.findByPk(id);
    if (!order) return res.status(404).json({ error: "Order not found" });

    // เช็คสิทธิ์: คนเปลี่ยนต้องเป็นคนขายเจ้าของออเดอร์นั้น
    if (order.sellerId !== req.user.id) {
        return res.status(403).json({ error: "คุณไม่มีสิทธิ์แก้ไขออเดอร์นี้" });
    }

    order.status = status;
    await order.save();

    res.json({ message: "อัปเดตสถานะสำเร็จ", order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "อัปเดตล้มเหลว" });
  }
};