const { Review, User, Order } = require("../models");

// สร้างรีวิว
exports.createReview = async (req, res) => {
  try {
    const { orderId, sellerId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    // เช็คว่าเคยรีวิวออเดอร์นี้ไปหรือยัง
    const existingReview = await Review.findOne({ where: { orderId } });
    if (existingReview) {
      return res.status(400).json({ error: "คุณได้รีวิวรายการนี้ไปแล้ว" });
    }

    const newReview = await Review.create({
      reviewerId,
      sellerId,
      orderId,
      rating,
      comment
    });

    res.status(201).json(newReview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการรีวิว" });
  }
};

// ดึงรีวิวของผู้ขายคนนั้น
exports.getSellerReviews = async (req, res) => {
  try {
    const { sellerId } = req.params;
    const reviews = await Review.findAll({
      where: { sellerId },
      include: [{ model: User, as: 'Reviewer', attributes: ['name', 'avatar'] }],
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: "Error fetching reviews" });
  }
};