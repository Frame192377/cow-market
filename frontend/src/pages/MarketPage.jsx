import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// ประกาศตัวแปร URL Backend
const API_BASE_URL = "http://localhost:5000";

const MarketPage = () => {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ ฟังก์ชันจัดการ URL รูปภาพ (รองรับทั้งแบบมี /uploads และไม่มี)
  const getImageUrl = (images) => {
    if (images && Array.isArray(images) && images.length > 0) {
      let imagePath = images[0];

      // กรณีที่ 1: ใน Database เก็บ path เต็มมาแล้ว (เช่น /uploads/170xxx.jpg)
      if (imagePath.startsWith('/uploads')) {
        return `${API_BASE_URL}${imagePath}`;
      }
      
      // กรณีที่ 2: ใน Database เก็บแค่ชื่อไฟล์ (เช่น 170xxx.jpg) - สำหรับข้อมูลเก่า
      return `${API_BASE_URL}/uploads/${imagePath}`;
    }
    return null;
  };

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/api/markets`);
        setMarkets(Array.isArray(response.data) ? response.data : response.data.data || []);
      } catch (error) {
        console.error("Error fetching markets:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarkets();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="h-px w-20 bg-gray-300"></div>
          <h1 className="font-bold text-lg text-gray-800">ตลาดนัด</h1>
          <div className="h-px w-20 bg-gray-300"></div>
        </div>
        <p className="font-semibold text-sm text-gray-500 uppercase">Cow market</p>
      </div>

      {/* Container สีขาว */}
      <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        
        {markets.length === 0 ? (
          <p className="text-center text-gray-400 py-20">ไม่พบรายการตลาดนัด</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {markets.map((market) => (
              <div 
                key={market.id} 
                className="bg-white rounded-xl border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full group"
              >
                
                {/* ส่วนรูปภาพ */}
                <div className="h-44 overflow-hidden relative bg-gray-100 flex items-center justify-center">
                  {getImageUrl(market.images) ? (
                    <img
                      src={getImageUrl(market.images)}
                      alt={market.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://placehold.co/600x400?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-300">
                        <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        <span className="text-xs font-bold">No Image</span>
                    </div>
                  )}
                  
                  {/* Badge วันที่ */}
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-gray-700 shadow-sm z-10">
                    {market.date ? market.date.split(' ')[0] : 'Coming Soon'}
                  </div>
                </div>
                
                {/* ส่วนเนื้อหา */}
                <div className="p-5 flex flex-col flex-grow text-left">
                  <h3 className="text-lg font-bold mb-4 text-gray-900 line-clamp-1">{market.name}</h3>
                  
                  <div className="space-y-2 text-sm text-gray-600 flex-grow mb-6">
                      <div className="flex items-start gap-2">
                          <span className="font-bold text-gray-900 min-w-[40px]">ที่ตั้ง:</span> 
                          <span className="line-clamp-1">{market.location}</span>
                      </div>
                      <div className="flex items-start gap-2">
                          <span className="font-bold text-gray-900 min-w-[40px]">เวลา:</span> 
                          <span className="line-clamp-1">{market.date}</span>
                      </div>
                  </div>

                  {/* ปุ่มสีดำ */}
                  <div className="mt-auto pt-4 border-t border-gray-50">
                      <button
                        onClick={() => navigate(`/market/${market.id}`)}
                        className="mt-2 px-4 py-1 rounded-full bg-green-500 text-white text-xs"
                      >
                        ดูรายละเอียด
                      </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketPage;