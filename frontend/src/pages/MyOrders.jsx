// src/pages/MyOrders.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const API_URL = "http://localhost:5000";

// Helper Functions
const getProductImageUrl = (path) => path ? (path.startsWith("http") ? path : `${API_URL}${path}`) : "https://via.placeholder.com/400x300?text=No+Image";
const formatDate = (dateString) => new Date(dateString).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });

export default function MyOrders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // State Modal & รีวิว
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ orderId: null, sellerId: null, rating: 5, comment: "" });
  const [reviewedOrderIds, setReviewedOrderIds] = useState([]); // เก็บ ID ที่รีวิวแล้วใน session นี้

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders/buyer");
        setOrders(res.data);
      } catch (err) {
        console.error("Error fetching my orders:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const submitReview = async () => {
    try {
      await API.post("/reviews", reviewData);
      alert("ขอบคุณสำหรับการรีวิว!");
      setShowReviewModal(false);
      setReviewedOrderIds([...reviewedOrderIds, reviewData.orderId]);
    } catch (err) {
      alert("เกิดข้อผิดพลาดในการรีวิว");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      
      {/* Modal รีวิว */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowReviewModal(false)}>
          <div className="bg-white p-6 rounded-2xl w-full max-w-sm m-4 shadow-2xl animate-fade-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-center mb-4 text-gray-800">ให้คะแนนสินค้า</h3>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setReviewData({ ...reviewData, rating: star })} className="focus:outline-none transition transform hover:scale-110">
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${star <= reviewData.rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                </button>
              ))}
            </div>
            <textarea className="w-full border border-gray-300 rounded-lg p-3 mb-4 text-sm focus:ring-2 focus:ring-yellow-400 outline-none" rows="3" placeholder="เขียนรีวิวเพิ่มเติม..." value={reviewData.comment} onChange={e => setReviewData({...reviewData, comment: e.target.value})}></textarea>
            <div className="flex gap-2">
                <button onClick={() => setShowReviewModal(false)} className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-xl font-bold hover:bg-gray-300">ยกเลิก</button>
                <button onClick={submitReview} className="flex-1 bg-green-600 text-white py-2 rounded-xl font-bold hover:bg-green-700 shadow-lg shadow-green-200">ส่งรีวิว</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-lg transition">
                ← กลับไปหน้าโปรไฟล์
            </button>
            <h1 className="text-2xl font-bold text-gray-800">ประวัติการสั่งซื้อ ({orders.length})</h1>
        </div>

        {orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-lg">คุณยังไม่เคยสั่งซื้อสินค้า</p>
            </div>
        ) : (
            <div className="space-y-4">
                {orders.map((order) => {
                    // Logic เช็คปุ่มรีวิว
                    const isReviewed = reviewedOrderIds.includes(order.id) || order.Review; 
                    
                    return (
                    <div key={order.id} className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition">
                        
                        {/* รูป + ชื่อสินค้า */}
                        <div className="flex items-center gap-5 w-full md:w-auto">
                            <img 
                                src={getProductImageUrl(order.Product?.images?.[0])} 
                                className="w-20 h-20 rounded-xl object-cover bg-gray-100 border border-gray-100" 
                                alt="product"
                            />
                            <div>
                                <h4 className="font-bold text-gray-800 text-lg">{order.Product?.name}</h4>
                                <p className="text-sm text-gray-500">ร้าน: {order.Seller?.name}</p>
                                <p className="text-xs text-gray-400 mt-1">สั่งเมื่อ: {formatDate(order.createdAt)}</p>
                            </div>
                        </div>

                        {/* ราคา */}
                        <div className="text-right w-full md:w-auto">
                            <p className="text-gray-500 text-xs uppercase font-bold">ยอดสุทธิ</p>
                            <p className="text-xl font-extrabold text-green-600">{Number(order.totalPrice).toLocaleString()} ฿</p>
                        </div>

                        {/* สถานะ + ปุ่มรีวิว */}
                        <div className="w-full md:w-auto flex flex-col items-end gap-3">
                           <span className={`px-4 py-1.5 rounded-full text-sm font-bold shadow-sm
                              ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : ''}
                              ${order.status === 'paid' ? 'bg-blue-100 text-blue-700' : ''}
                              ${order.status === 'shipped' ? 'bg-purple-100 text-purple-700' : ''}
                              ${order.status === 'completed' ? 'bg-green-100 text-green-700' : ''}
                              ${order.status === 'cancelled' ? 'bg-red-100 text-red-700' : ''}
                           `}>
                              {order.status === 'pending' && '⏳ รอดำเนินการ'}
                              {order.status === 'paid' && '💰 ร้านรับยอดแล้ว'}
                              {order.status === 'shipped' && '🚚 จัดส่งแล้ว'}
                              {order.status === 'completed' && '✅ สำเร็จ'}
                              {order.status === 'cancelled' && '❌ ยกเลิก'}
                           </span>

                           {/* ปุ่มรีวิว */}
                           {(order.status === 'completed' || order.status === 'shipped') && !isReviewed && (
                             <button 
                               onClick={() => {
                                 setReviewData({ orderId: order.id, sellerId: order.sellerId, rating: 5, comment: "" });
                                 setShowReviewModal(true);
                               }}
                               className="text-xs bg-yellow-400 hover:bg-yellow-500 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-1 shadow-md transition transform hover:scale-105"
                             >
                               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                               ให้คะแนน
                             </button>
                           )}
                           
                           {isReviewed && (
                               <span className="text-xs text-gray-400 font-bold bg-gray-100 px-3 py-1 rounded-lg border border-gray-200">
                                   ✓ รีวิวแล้ว
                               </span>
                           )}
                        </div>
                    </div>
                )})}
            </div>
        )}
      </div>
    </div>
  );
}