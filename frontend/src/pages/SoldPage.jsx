// frontend/src/pages/SoldPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function SoldPage() {
  const [soldCows, setSoldCows] = useState([]);
  const [loading, setLoading] = useState(true); // เพิ่ม state loading
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSold = async () => {
      try {
        setLoading(true);
        // ดึงเฉพาะตัวที่ status = sold
        const res = await API.get("/cows?status=sold");
        setSoldCows(res.data);
      } catch (err) {
        console.error("Error fetching sold items:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSold();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="text-gray-500 font-medium">กำลังโหลดรายการ...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* ✅ หัวข้อปรับปรุงใหม่ (มีเส้นขีด) */}
        <div className="flex items-center justify-center text-center mb-12">
            <div className="h-px bg-gray-300 flex-grow max-w-[100px] md:max-w-[150px]"></div>
            <div className="mx-6">
                <h1 className="font-bold text-lg text-gray-800">
                    รายการที่ขายแล้ว
                </h1>
                <p className="text-xs md:text-sm text-gray-500 font-medium mt-2 tracking-widest uppercase">
                    Cow market
                </p>
            </div>
            <div className="h-px bg-gray-300 flex-grow max-w-[100px] md:max-w-[150px]"></div>
        </div>

        {/* เนื้อหา */}
        {soldCows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white rounded-2xl shadow-sm border border-gray-100">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            <p className="text-lg font-medium">ยังไม่มีรายการที่ขายแล้ว</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {soldCows.map((c) => (
              <div 
                key={c.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col group relative"
              >
                {/* รูปภาพ */}
                <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                  {c.images?.[0] ? (
                    <img 
                        src={`http://localhost:5000${c.images[0]}`} 
                        className="w-full h-full object-cover grayscale opacity-60 group-hover:scale-105 transition-transform duration-500" 
                        alt={c.name} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <span className="text-sm">ไม่มีรูปภาพ</span>
                    </div>
                  )}
                  {/* Overlay สีดำจางๆ */}
                  <div className="absolute inset-0 bg-black/10"></div>
                  
                  {/* ป้าย SOLD OUT */}
                  <div className="absolute top-3 right-3">
                      <span className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full shadow-sm border border-red-600 tracking-wider">
                        SOLD
                      </span>
                  </div>
                </div>
                
                {/* รายละเอียด */}
                <div className="p-4 flex flex-col flex-grow text-center">
                  <h3 className="font-bold text-gray-800 text-base md:text-lg mb-1 truncate">{c.name}</h3>
                  
                  <p className="text-red-500 text-xs md:text-sm font-semibold mb-3 flex items-center justify-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    ปิดการขายแล้ว
                  </p>

                  <button 
                    onClick={() => navigate(`/cows/${c.id}`)} 
                    className="mt-auto w-full py-2 bg-gray-100 text-gray-700 text-xs md:text-sm font-medium rounded-full hover:bg-gray-200 transition-colors"
                  >
                    ดูรายละเอียดเดิม
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}