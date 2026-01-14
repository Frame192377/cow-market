// frontend/src/pages/CowDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import API from "../services/api";

const API_URL = "http://localhost:5000";

export default function CowDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [cow, setCow] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  // State สำหรับรูปภาพ
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // State สำหรับปุ่ม Next/Prev Post
  const [prevId, setPrevId] = useState(null);
  const [nextId, setNextId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored));
      } catch (e) {
        console.error("Parse user error:", e);
      }
    }
  }, []);

  // Fetch ข้อมูลวัว และ หา Next/Prev ID
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // 1. ดึงข้อมูลวัวตัวปัจจุบัน
        const res = await API.get(`/cows/${id}`);
        setCow(res.data);
        setCurrentImageIndex(0); // รีเซ็ตรูปภาพเมื่อเปลี่ยนโพสต์

        // 2. ดึงข้อมูลวัวทั้งหมดเพื่อหา ID ก่อนหน้าและถัดไป (Logic เบื้องต้น)
        // หมายเหตุ: ในระบบจริงควรมี API endpoint เช่น /cows/:id/neighbors เพื่อประสิทธิภาพที่ดีกว่า
        const allRes = await API.get('/cows'); 
        const allCows = allRes.data; // สมมติว่า response เป็น array ของวัว
        
        // หา index ของวัวตัวปัจจุบัน
        // แปลง id เป็น string หรือ number ให้ตรงกันเพื่อเปรียบเทียบ
        const currentIndex = allCows.findIndex(c => c.id.toString() === id.toString());

        if (currentIndex !== -1) {
          // ถ้ามีตัวก่อนหน้า
          if (currentIndex > 0) {
            setPrevId(allCows[currentIndex - 1].id);
          } else {
            setPrevId(null);
          }

          // ถ้ามีตัวถัดไป
          if (currentIndex < allCows.length - 1) {
            setNextId(allCows[currentIndex + 1].id);
          } else {
            setNextId(null);
          }
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const images = cow?.images && Array.isArray(cow.images) && cow.images.length > 0
    ? cow.images
    : [];

  const getImageUrl = (path) => {
    if (!path) return "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800";
    return `${API_URL}${path}`;
  };

  // จัดการเลื่อนรูปใน Lightbox
  const nextImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // จัดการเปลี่ยนโพสต์ (Navigation)
  const handlePrevPost = () => {
    if (prevId) navigate(`/cows/${prevId}`);
  };

  const handleNextPost = () => {
    if (nextId) navigate(`/cows/${nextId}`);
  };

  const handleDelete = async () => {
    if (!window.confirm("ต้องการลบโพสต์นี้หรือไม่ ?")) return;
    try {
      await API.delete(`/cows/${cow.id}`);
      alert("ลบโพสต์เรียบร้อยแล้ว");
      navigate("/");
    } catch (err) {
      console.error("DELETE ERROR:", err.response || err);
      alert(err.response?.data?.error || "ลบโพสต์ไม่สำเร็จ");
    }
  };

  const handleEdit = () => {
    navigate(`/cows/${cow.id}/edit`);
  };

  const handleContactOwner = () => {
    if (cow && cow.User && cow.User.id) {
        navigate(`/profile/${cow.User.id}`); 
    } else if (cow && cow.userId) {
         navigate(`/profile/${cow.userId}`);
    } else {
        alert("ไม่พบข้อมูลผู้ขาย");
    }
  };

  const handleMarkSold = async () => {
    if (!window.confirm("ยืนยันว่าขายวัวตัวนี้แล้ว? รายการจะถูกย้ายไปที่หน้า 'ขายแล้ว'")) return;
    try {
      await API.put(`/cows/${cow.id}/sold`); 
      alert("ปิดการขายเรียบร้อย!");
      navigate("/sold-out"); 
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการอัปเดตสถานะ");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-200">
        <span className="text-gray-600">กำลังโหลดข้อมูลวัว...</span>
      </div>
    );
  }

  if (!cow) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200">
        <p className="mb-4 text-red-500">ไม่พบข้อมูลวัวตัวนี้</p>
        <button onClick={() => navigate(-1)} className="px-4 py-2 bg-black text-white rounded-full">กลับ</button>
      </div>
    );
  }

  const sellerName = cow.User?.name || "ไม่ระบุ";
  const marketName = cow.Market?.name || "-";
  const approxPrice = cow.price?.toLocaleString() || "-";
  const isOwner = currentUser && (cow.userId === currentUser.id || cow.User?.id === currentUser.id);

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      
      {/* Lightbox */}
      {isLightboxOpen && images.length > 0 && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center backdrop-blur-sm" onClick={() => setIsLightboxOpen(false)}>
          <button className="absolute top-5 right-5 text-white p-2 hover:bg-white/20 rounded-full transition" onClick={() => setIsLightboxOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <img src={getImageUrl(images[currentImageIndex])} alt="Fullsize" className="max-w-full max-h-[90vh] object-contain select-none" onClick={(e) => e.stopPropagation()} />
          {images.length > 1 && (
            <>
              <button className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/20 rounded-full transition" onClick={prevImage}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-3 hover:bg-white/20 rounded-full transition" onClick={nextImage}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
              <div className="absolute bottom-5 text-white font-medium bg-black/50 px-4 py-1 rounded-full">{currentImageIndex + 1} / {images.length}</div>
            </>
          )}
        </div>
      )}

      {/* Header */}
      <header className="pt-10 pb-6 text-center">
        <h1 className="text-3xl font-extrabold mb-2 text-gray-800">รายละเอียดวัว</h1>
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-28 bg-gray-300" />
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Cow market</span>
          <span className="h-px w-28 bg-gray-300" />
        </div>
      </header>

      {/* Main Container with Navigation Arrows */}
      <main className="max-w-[90rem] mx-auto px-4 flex items-center justify-center gap-6">
        
        {/* --- ปุ่มลูกศรซ้าย (Previous Post) --- */}
        <div className="hidden xl:block">
           {prevId ? (
             <button 
               onClick={handlePrevPost}
               className="group bg-white hover:bg-green-500 hover:text-white text-gray-400 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-green-200 transition-all transform hover:scale-110 focus:outline-none"
               title="โพสต์ก่อนหน้า"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
             </button>
           ) : (
             <div className="w-14 h-14" /> /* พื้นที่ว่างถ้าไม่มีปุ่ม */
           )}
        </div>

        {/* --- Card กลาง (ตัวเดิมของคุณ) --- */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row max-w-6xl w-full">
          
          {/* --- ฝั่งซ้าย: รูปภาพ --- */}
          <div className="w-full md:w-1/2 bg-gray-100 relative group border-r border-gray-100 md:h-[500px] overflow-hidden">
              {cow.status === 'sold' && (
                <div className="absolute top-5 right-[-50px] rotate-45 bg-red-600 text-white px-12 py-1 font-bold shadow-md z-20">SOLD OUT</div>
              )}
              
              <div className="w-full h-[400px] md:h-full flex items-center justify-center relative overflow-hidden bg-gray-200">
                <img
                  src={getImageUrl(images.length > 0 ? images[currentImageIndex] : null)}
                  alt={cow.name}
                  className={`w-full h-full object-cover cursor-zoom-in transition-transform duration-500 hover:scale-110 ${cow.status === 'sold' ? 'grayscale opacity-70' : ''}`}
                  onClick={() => images.length > 0 && setIsLightboxOpen(true)}
                />
                
                {images.length > 1 && (
                  <>
                    <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                    </button>
                    <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                    </button>
                    <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
                {images.length === 0 && <div className="text-gray-400">ไม่มีรูปภาพ</div>}
              </div>

              {images.length > 1 && (
                <div className="absolute bottom-4 left-4 right-16 flex gap-2 overflow-x-auto p-1 no-scrollbar">
                  {images.map((img, idx) => (
                    <button 
                      key={idx} 
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-white scale-110 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}
                    >
                      <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="thumb" />
                    </button>
                  ))}
                </div>
              )}
          </div>

          {/* --- ฝั่งขวา: รายละเอียด --- */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col justify-center">
            
            <div className="border-b border-gray-100 pb-6 mb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">{cow.name}</h2>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            ลงประกาศเมื่อ: {formatDate(cow.createdAt)}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-3xl font-extrabold text-green-600">{approxPrice}</p>
                        <p className="text-sm text-gray-400 font-medium">บาท</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-8">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium border border-blue-100">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" /></svg>
                    พันธุ์: {cow.breed || "-"}
                </span>
                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${cow.gender === 'ผู้' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-pink-50 text-pink-700 border-pink-100'}`}>
                    {cow.gender === 'ผู้' ? '♂ เพศผู้' : '♀ เพศเมีย'}
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-sm font-medium border border-amber-100">
                    🎂 อายุ: {cow.age ? `${cow.age} ปี` : "-"}
                </span>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 mb-8 text-gray-700">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" /></svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">น้ำหนัก</p>
                        <p className="font-semibold">{cow.weight ? `${cow.weight} กก.` : "-"}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">จังหวัด</p>
                        <p className="font-semibold">{cow.location || "-"}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">ผู้ขาย</p>
                        <p className="font-semibold">{sellerName}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">พ่อพันธุ์/น้ำเชื้อ</p>
                        <p className="font-semibold">{cow.sireName || "-"}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">ขายที่ตลาดนัด</p>
                        {cow.Market ? (
                           <Link 
                             to={`/market/${cow.marketId}`} 
                             className="inline-block font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-lg mt-1 transition-all duration-300 hover:scale-110 hover:shadow-md hover:bg-blue-100 cursor-pointer"
                           >
                             {marketName} ➚
                           </Link>
                        ) : (
                           <p className="font-semibold text-gray-500">-</p>
                        )}
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">ประวัติวัคซีน</p>
                        <p className="font-semibold text-sm leading-snug">
                            {cow.vaccineHistory || "-"}
                        </p>
                    </div>
                </div>

                <div className="col-span-2 mt-2">
                    <p className="text-xs text-gray-400 font-bold uppercase mb-1">รายละเอียดเพิ่มเติม</p>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-600 text-sm leading-relaxed max-h-40 overflow-y-auto">
                        {cow.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 flex flex-wrap gap-3">
                <button onClick={() => navigate(-1)} className="flex-1 px-4 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold text-sm hover:bg-gray-200 transition">
                    ← กลับ
                </button>

                <button 
                    onClick={handleContactOwner}
                    disabled={cow.status === 'sold'}
                    className="flex-[2] px-4 py-3 rounded-xl bg-green-500 text-white font-bold text-sm hover:bg-green-600 shadow-lg shadow-green-200 disabled:opacity-50 disabled:shadow-none transition flex items-center justify-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                    ติดต่อเจ้าของ
                </button>

                {isOwner && (
                    <>
                        {cow.status !== 'sold' && (
                            <button onClick={handleMarkSold} className="flex-1 px-4 py-3 rounded-xl bg-blue-500 text-white font-bold text-sm hover:bg-blue-600 shadow-lg shadow-blue-200 transition">
                                ขายแล้ว
                            </button>
                        )}
                        <button onClick={handleEdit} className="p-3 rounded-xl bg-yellow-400 text-white hover:bg-yellow-500 shadow-lg shadow-yellow-200 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                        </button>
                        <button onClick={handleDelete} className="p-3 rounded-xl bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-200 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                    </>
                )}
            </div>

          </div>
        </div>

        {/* --- ปุ่มลูกศรขวา (Next Post) --- */}
        <div className="hidden xl:block">
           {nextId ? (
             <button 
               onClick={handleNextPost}
               className="group bg-white hover:bg-green-500 hover:text-white text-gray-400 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-green-200 transition-all transform hover:scale-110 focus:outline-none"
               title="โพสต์ถัดไป"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
             </button>
           ) : (
             <div className="w-14 h-14" /> /* พื้นที่ว่างถ้าไม่มีปุ่ม */
           )}
        </div>

      </main>
    </div>
  );
}