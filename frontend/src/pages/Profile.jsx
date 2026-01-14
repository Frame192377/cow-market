// src/pages/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

const API_URL = "http://localhost:5000";

// Helper Functions
const getAvatarUrl = (avatar) => avatar ? (avatar.startsWith("http") ? avatar : `${API_URL}${avatar}`) : "https://cdn-icons-png.flaticon.com/512/847/847969.png";
const getProductImageUrl = (path) => path ? (path.startsWith("http") ? path : `${API_URL}${path}`) : "https://via.placeholder.com/400x300?text=No+Image";
const formatDate = (dateString) => new Date(dateString).toLocaleDateString("th-TH", { day: "numeric", month: "long", year: "numeric" });

export default function Profile() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [profileUser, setProfileUser] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Data for Badges
  const [sellerOrders, setSellerOrders] = useState([]); // ออเดอร์ที่คนอื่นสั่งเรา
  const [buyerOrders, setBuyerOrders] = useState([]);   // ออเดอร์ที่เราสั่งเขา

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const storedUser = localStorage.getItem("user");
        let myId = null;
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setCurrentUser(parsedUser);
          myId = parsedUser.id;
        }

        const targetId = id || myId;
        if (!targetId) { navigate("/login"); return; }

        const res = await API.get(`/users/${targetId}`);
        setProfileUser(res.data);
      } catch (err) { console.error(err); } finally { setLoading(false); }
    };
    fetchData();
  }, [id, navigate]);

  const isOwner = currentUser && profileUser && currentUser.id === profileUser.id;

  useEffect(() => {
    if (isOwner) {
      // ดึงข้อมูลเพื่อนับจำนวน
      API.get("/orders/seller").then(res => setSellerOrders(res.data)).catch(err => console.error(err));
      API.get("/orders/buyer").then(res => setBuyerOrders(res.data)).catch(err => console.error(err));
    }
  }, [isOwner]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const StarDisplay = ({ rating }) => (
    <div className="flex text-yellow-400">
      {[...Array(5)].map((_, i) => (
        <svg key={i} xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${i < Math.round(rating) ? "fill-current" : "text-gray-300"}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );

  if (loading) return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;
  if (!profileUser) return <div className="min-h-screen flex items-center justify-center">ไม่พบผู้ใช้งาน</div>;

  const activeListingsCount = profileUser.listings ? profileUser.listings.filter(item => item.status !== 'sold').length : 0;
  
  // 🔥 นับ Badge
  const newSellerOrdersCount = sellerOrders.filter(o => o.status === 'pending').length; // คนขาย: มีออเดอร์ใหม่กี่อัน
  const activeBuyerOrdersCount = buyerOrders.filter(o => ['paid', 'shipped'].includes(o.status)).length; // คนซื้อ: มีของที่รอรับกี่อัน

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans pb-20">
      
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black">{isOwner ? "โปรไฟล์ของฉัน" : "ข้อมูลผู้ขาย"}</h1>
        <div className="flex items-center justify-center gap-4 mt-2">
          <span className="h-px w-20 bg-gray-400" />
          <span className="text-gray-500">Cow Market Profile</span>
          <span className="h-px w-20 bg-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-lg w-full max-w-5xl p-8 md:p-12 relative mx-auto mb-10">
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 text-gray-400 hover:text-gray-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
        </button>

        <div className="flex flex-col md:flex-row gap-10 items-start">
          {/* Profile Info (Left) */}
          <div className="flex flex-col items-center w-full md:w-1/3 text-center">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-lg mb-4 bg-gray-200 border-4 border-white">
              <img src={getAvatarUrl(profileUser.avatar)} alt={profileUser.name} className="w-full h-full object-cover" />
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-2xl font-bold text-gray-800">{profileUser.name}</h2>
                <span className="bg-blue-500 text-white rounded-full p-1 shadow-sm" title="ยืนยันตัวตนแล้ว">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </span>
            </div>

            <div className="flex items-center gap-2 mb-6 bg-yellow-50 px-4 py-1.5 rounded-full border border-yellow-200">
               <span className="font-extrabold text-yellow-600 text-lg">{profileUser.avgRating || "0.0"}</span>
               <StarDisplay rating={profileUser.avgRating || 0} />
               <span className="text-xs text-gray-500 font-medium">({profileUser.reviewCount || 0} รีวิว)</span>
            </div>
            
            <div className="flex gap-3 w-full justify-center">
                <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-xl flex-1 max-w-[120px]">
                    <p className="text-xs text-green-700 font-bold uppercase mb-1">ขายแล้ว</p>
                    <p className="text-xl font-extrabold text-gray-800">{profileUser.soldCount || 0}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 px-4 py-2 rounded-xl flex-1 max-w-[120px]">
                    <p className="text-xs text-blue-700 font-bold uppercase mb-1">ลงขายอยู่</p>
                    <p className="text-xl font-extrabold text-gray-800">{activeListingsCount}</p>
                </div>
            </div>
            
            {isOwner && (
              <button onClick={() => navigate("/profile/edit")} className="mt-6 px-6 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-bold hover:bg-gray-200 transition w-full max-w-[200px]">แก้ไขโปรไฟล์</button>
            )}
          </div>

          {/* Contact Info (Right) */}
          <div className="w-full md:w-2/3 space-y-4 pt-2">
            <h3 className="text-lg font-bold text-gray-800 border-b border-gray-100 pb-2">ข้อมูลติดต่อ</h3>
            <div className="space-y-3 text-sm md:text-base">
                <p><span className="font-bold text-gray-500">เป็นสมาชิกเมื่อ:</span> {formatDate(profileUser.createdAt)}</p>
                <p><span className="font-bold text-gray-500">ที่อยู่:</span> {profileUser.address || "-"}</p>
                <p><span className="font-bold text-gray-500">อีเมล:</span> {profileUser.email}</p>
                <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg">
                    <span className="font-bold text-gray-500">เบอร์โทร:</span>
                    <a href={`tel:${profileUser.phoneNumber}`} className="text-green-600 font-bold text-lg hover:underline">{profileUser.phoneNumber || "-"}</a>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {profileUser.facebook && <div className="flex gap-2 bg-blue-50 p-2 rounded border border-blue-100"><span className="font-bold text-blue-700">FB:</span> {profileUser.facebook}</div>}
                    {profileUser.line && <div className="flex gap-2 bg-green-50 p-2 rounded border border-green-100"><span className="font-bold text-green-700">Line:</span> {profileUser.line}</div>}
                </div>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="mt-8 pt-6 border-t border-gray-100 flex justify-center gap-4 flex-wrap">
            <button onClick={() => navigate("/add-listing")} className="px-6 py-3 bg-green-600 text-white rounded-full font-bold shadow hover:bg-green-700 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              ลงประกาศขาย
            </button>
            <button onClick={handleLogout} className="px-6 py-3 bg-gray-800 text-white rounded-full font-bold shadow hover:bg-black flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              ออกจากระบบ
            </button>
          </div>
        )}
      </div>

      {/* ✅✅✅ ส่วนเมนูจัดการ (Seller & Buyer) - 2 ปุ่มใหญ่ */}
      {isOwner && (
        <div className="max-w-6xl mx-auto px-4 mb-10 grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. ปุ่มจัดการคำสั่งซื้อ (สำหรับคนขาย) */}
            <div 
                onClick={() => navigate("/order-dashboard")}
                className={`p-6 rounded-2xl shadow-sm border cursor-pointer transition-all flex items-center justify-between group
                    ${newSellerOrdersCount > 0 ? 'bg-yellow-50 border-yellow-300 hover:bg-yellow-100' : 'bg-white border-gray-200 hover:border-green-500'}
                `}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-full ${newSellerOrdersCount > 0 ? 'bg-yellow-500 text-white animate-pulse' : 'bg-gray-100 text-gray-500 group-hover:bg-green-100 group-hover:text-green-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 group-hover:text-green-700 transition">จัดการคำสั่งซื้อ (ขาย)</h2>
                        <p className="text-xs text-gray-500">
                            {newSellerOrdersCount > 0 
                                ? <span className="text-red-600 font-bold">⚠️ มี {newSellerOrdersCount} ออเดอร์ใหม่!</span>
                                : "เช็คออเดอร์ที่เข้ามา"
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {newSellerOrdersCount > 0 && <span className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md animate-bounce">{newSellerOrdersCount}</span>}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:translate-x-2 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
            </div>

            {/* 2. ปุ่มประวัติการสั่งซื้อ (สำหรับคนซื้อ) */}
            <div 
                onClick={() => navigate("/my-orders")}
                className={`p-6 rounded-2xl shadow-sm border cursor-pointer transition-all flex items-center justify-between group
                    ${activeBuyerOrdersCount > 0 ? 'bg-blue-50 border-blue-300 hover:bg-blue-100' : 'bg-white border-gray-200 hover:border-blue-500'}
                `}
            >
                <div className="flex items-center gap-4">
                    <div className={`p-4 rounded-full ${activeBuyerOrdersCount > 0 ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'}`}>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition">ประวัติการสั่งซื้อ (ซื้อ)</h2>
                        <p className="text-xs text-gray-500">
                            {activeBuyerOrdersCount > 0 
                                ? <span className="text-blue-600 font-bold">🚚 {activeBuyerOrdersCount} รายการที่ต้องติดตาม</span>
                                : "ดูรายการที่คุณเคยสั่งซื้อ"
                            }
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {activeBuyerOrdersCount > 0 && <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md">{activeBuyerOrdersCount}</span>}
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 group-hover:translate-x-2 transition" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
            </div>

        </div>
      )}

      {/* Listings Grid (My Products) */}
      <div className="max-w-6xl mx-auto px-4 mt-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4 border-l-4 border-black pl-3">วัวที่ลงขาย</h2>
        {profileUser.listings && profileUser.listings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {profileUser.listings.map((item) => (
                    <div key={item.id} onClick={() => navigate(`/cows/${item.id}`)} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer hover:shadow-md transition">
                        <div className="h-40 bg-gray-200 relative">
                             {item.status === 'sold' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-bold">SOLD OUT</div>}
                             <img src={getProductImageUrl(item.images?.[0])} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="p-3">
                            <h3 className="font-bold text-gray-800 truncate text-sm">{item.name}</h3>
                            <p className="text-green-600 font-bold text-sm mt-1">{Number(item.price).toLocaleString()} บ.</p>
                        </div>
                    </div>
                ))}
            </div>
        ) : <p className="text-center text-gray-400 py-10">คุณยังไม่ได้ลงขายสินค้า</p>}
      </div>

    </div>
  );
}