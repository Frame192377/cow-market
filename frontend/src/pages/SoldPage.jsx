// frontend/src/pages/SoldPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function SoldPage() {
  const [soldCows, setSoldCows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSold = async () => {
      try {
        setLoading(true);
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <span className="text-gray-500 font-medium animate-pulse">กำลังโหลดรายการ...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 font-sans flex justify-center items-start">
      
      {/* ✅✅✅ กรอบใหญ่สีขาว (เหมือนในรูป) */}
      <div className="w-full max-w-[90rem] bg-white rounded-[2.5rem] shadow-xl p-8 md:p-12 min-h-[600px] border border-gray-100">

        {/* หัวข้อ (Header) */}
        <div className="flex items-center justify-center text-center mb-10">
            <div className="h-px bg-gray-200 flex-grow max-w-[100px] md:max-w-[200px]"></div>
            <div className="mx-6">
                <h1 className="font-extrabold text-2xl md:text-3xl text-gray-800 tracking-tight">
                    วัวที่ขายแล้ว
                </h1>
                <p className="text-xs text-gray-400 font-bold mt-2 tracking-[0.2em] uppercase">
                    Cow Market
                </p>
            </div>
            <div className="h-px bg-gray-200 flex-grow max-w-[100px] md:max-w-[200px]"></div>
        </div>

        {/* เนื้อหา (Grid) */}
        {soldCows.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-gray-300">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
             </svg>
             <p className="text-xl font-medium">ยังไม่มีรายการที่ขายแล้ว</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {soldCows.map((c) => (
              <div 
                key={c.id} 
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group relative"
              >
                {/* รูปภาพ */}
                <div className="w-full h-48 md:h-56 bg-gray-100 relative overflow-hidden">
                  {c.images?.[0] ? (
                    <img 
                        src={`http://localhost:5000${c.images[0]}`} 
                        className="w-full h-full object-cover grayscale brightness-90 group-hover:scale-110 group-hover:grayscale-0 transition-all duration-700" 
                        alt={c.name} 
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-300 text-sm">No Image</div>
                  )}
                  
                  {/* Overlay ดำจางๆ */}
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>
                  
                  {/* ป้าย SOLD OUT */}
                  <div className="absolute top-3 right-3 z-10">
                      <span className="bg-red-500 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-md shadow-md tracking-wider">
                        SOLD
                      </span>
                  </div>
                </div>
                
                {/* รายละเอียด */}
                <div className="p-4 flex flex-col flex-grow text-center">
                  <h3 className="font-bold text-gray-800 text-base mb-1 truncate">{c.name}</h3>
                  
                  <div className="flex items-center justify-center gap-1 mb-4">
                    <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                    <p className="text-red-500 text-xs font-bold">ปิดการขายแล้ว</p>
                  </div>

                  <button 
                    onClick={() => navigate(`/cows/${c.id}`)} 
                    className="mt-auto w-full py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-lg hover:bg-gray-100 hover:text-gray-900 transition-colors"
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