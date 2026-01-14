// src/pages/MarketDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const API_URL = "http://localhost:5000";

export default function MarketDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [market, setMarket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await API.get(`/markets/${id}`);
        setMarket(res.data);
        setCurrentImageIndex(0);

        // หา Next / Prev ID
        const allRes = await API.get('/markets');
        const allMarkets = allRes.data || [];
        const currentIndex = allMarkets.findIndex(m => m.id.toString() === id.toString());

        if (currentIndex !== -1) {
          if (currentIndex > 0) setPrevId(allMarkets[currentIndex - 1].id);
          else setPrevId(null);

          if (currentIndex < allMarkets.length - 1) setNextId(allMarkets[currentIndex + 1].id);
          else setNextId(null);
        }

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const images = market?.images && market.images.length > 0 ? market.images : [];

  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/600x400?text=No+Image";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  };

  const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
  const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

  const handleDelete = async () => {
    if (!window.confirm("ต้องการลบตลาดนัดนี้หรือไม่ ?")) return;
    try {
      await API.delete(`/markets/${id}`);
      alert("ลบตลาดนัดเรียบร้อยแล้ว");
      navigate("/market");
    } catch (err) {
      console.error("DELETE ERROR:", err);
      alert("ลบตลาดนัดไม่สำเร็จ");
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="text-gray-500 font-medium">กำลังโหลดข้อมูลตลาดนัด...</span>
    </div>
  );

  if (!market) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
        <p className="text-red-500 font-bold text-xl">ไม่พบข้อมูลตลาดนัด</p>
        <button onClick={() => navigate('/market')} className="px-6 py-2 bg-gray-800 text-white rounded-full hover:bg-black transition">
            กลับหน้าตลาดนัด
        </button>
    </div>
  );

  const isOwner = currentUser && market.userId === currentUser.id;

  // ✅✅✅ แก้ไขการดึงตัวแปรให้ตรงกับ Model (backend/models/Market.js)
  const location = market.location || "ไม่ระบุ";      // Model: location
  const openInfo = market.date || "-";               // Model: date (ใช้เก็บวันเวลา)
  const contact = market.contact || "-";             // Model: contact
  const ownerName = market.User?.name || "ไม่ระบุ";

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      
      <header className="pt-10 pb-6 text-center">
        <h1 className="text-3xl font-extrabold mb-2 text-gray-800">รายละเอียดตลาดนัด</h1>
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-28 bg-gray-300" />
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Cow Market</span>
          <span className="h-px w-28 bg-gray-300" />
        </div>
      </header>

      <main className="max-w-[90rem] mx-auto px-4 flex items-center justify-center gap-6 relative">
        
        {/* Previous Arrow */}
        <div className="hidden xl:block w-16 text-right">
           {prevId ? (
             <button onClick={() => navigate(`/market/${prevId}`)} className="group bg-white hover:bg-green-500 hover:text-white text-gray-400 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-110 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             </button>
           ) : <div className="w-14 h-14" />}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row max-w-5xl w-full">
          
          {/* Image Section */}
          <div className="w-full md:w-1/2 bg-gray-200 relative h-[400px] md:h-[500px] group">
            <img src={getImageUrl(images[currentImageIndex])} alt={market.name} className="w-full h-full object-cover"/>
            
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-2 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 focus:outline-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md">
                  {currentImageIndex + 1} / {images.length}
                </div>
                <div className="absolute bottom-4 left-4 flex gap-2 overflow-x-auto p-1 no-scrollbar max-w-[calc(100%-80px)]">
                 {images.map((img, idx) => (
                   <button key={idx} onClick={() => setCurrentImageIndex(idx)} className={`w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all focus:outline-none ${currentImageIndex === idx ? 'border-white scale-110 shadow-md' : 'border-white/50 opacity-70 hover:opacity-100'}`}>
                     <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="thumb" />
                   </button>
                 ))}
               </div>
              </>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col">
             
             <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 mb-2">{market.name}</h2>
                <div className="flex items-center gap-2 text-green-600 font-medium">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                    {/* ✅ ใช้ตัวแปร location */}
                    {location}
                </div>
             </div>

             <div className="space-y-4 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">วัน/เวลา เปิดทำการ</p>
                        {/* ✅ ใช้ตัวแปร openInfo (จาก field 'date') */}
                        <p className="font-medium text-gray-700">{openInfo}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">เบอร์โทรติดต่อ</p>
                        {/* ✅ ใช้ตัวแปร contact */}
                        <a href={`tel:${contact}`} className="font-medium text-gray-700 hover:text-green-600 transition">{contact}</a>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">ผู้ลงประกาศ</p>
                        <p className="font-medium text-gray-700">{ownerName}</p>
                    </div>
                </div>
             </div>

             <div className="mb-8">
                <p className="text-xs text-gray-400 font-bold uppercase mb-2">รายละเอียด / กฎระเบียบ</p>
                <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 text-gray-600 text-sm leading-relaxed overflow-y-auto max-h-40 custom-scrollbar">
                    {market.description || "ไม่มีรายละเอียดเพิ่มเติม"}
                </div>
             </div>

             <div className="mt-auto flex flex-wrap gap-3">
               <button onClick={() => navigate('/market')} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition flex items-center justify-center gap-2">
                 ← กลับ
               </button>

               {isOwner && (
                 <>
                   <button onClick={() => navigate(`/markets/${id}/edit`)} className="flex-1 px-4 py-3 bg-yellow-400 hover:bg-yellow-500 text-white rounded-xl font-bold shadow-lg shadow-yellow-200 transition flex items-center justify-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                     แก้ไข
                   </button>
                   <button onClick={handleDelete} className="flex-1 px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition flex items-center justify-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                     ลบ
                   </button>
                 </>
               )}
             </div>
          </div>
        </div>

        {/* Next Arrow */}
        <div className="hidden xl:block w-16 text-left">
           {nextId ? (
             <button onClick={() => navigate(`/market/${nextId}`)} className="group bg-white hover:bg-green-500 hover:text-white text-gray-400 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-110 focus:outline-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>
           ) : <div className="w-14 h-14" />}
        </div>

      </main>
    </div>
  );
}