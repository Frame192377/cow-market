import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// ประกาศตัวแปร URL Backend
const API_BASE_URL = "http://localhost:5000";

const MarketDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [market, setMarket] = useState(null);

  useEffect(() => {
    const fetchMarketDetail = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/markets/${id}`);
        setMarket(response.data);
      } catch (error) {
        console.error("Error fetching market detail:", error);
      }
    };
    fetchMarketDetail();
  }, [id]);

  if (!market) {
    return <div className="min-h-screen flex items-center justify-center text-xl">กำลังโหลดข้อมูล...</div>;
  }

  // ✅ ฟังก์ชันช่วยดึงรูปภาพ (รองรับ Path 2 แบบ)
  const getImageUrl = (images) => {
    if (images && Array.isArray(images) && images.length > 0) {
      let imagePath = images[0];

      // กรณีที่ 1: ใน Database เก็บ path เต็มมาแล้ว (/uploads/xxx.jpg)
      if (imagePath.startsWith('/uploads')) {
        return `${API_BASE_URL}${imagePath}`;
      }
      
      // กรณีที่ 2: ใน Database เก็บแค่ชื่อไฟล์ (xxx.jpg)
      return `${API_BASE_URL}/uploads/${imagePath}`;
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-200 p-8 flex flex-col items-center font-sans">
      
      <div className="text-center mb-12 w-full max-w-4xl">
        <h1 className="text-4xl font-bold mb-2 text-gray-800">{market.name}</h1>
        <div className="flex items-center justify-center gap-4">
            <div className="h-px w-32 bg-gray-500"></div>
            <h2 className="text-2xl font-bold text-black">Cow market</h2>
            <div className="h-px w-32 bg-gray-500"></div>
          </div>
      </div>

      <div className="flex flex-col md:flex-row gap-12 max-w-5xl w-full items-start justify-center">
        
        {/* รูปภาพ */}
        <div className="w-full md:w-1/2">
          <div className="shadow-xl rounded-sm overflow-hidden h-[500px] bg-gray-300 flex items-center justify-center">
            {getImageUrl(market.images) ? (
                <img 
                  src={getImageUrl(market.images)} 
                  alt={market.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    // 🔥 กันภาพแตก: ถ้าโหลดไม่ได้ให้ใช้รูปสำรอง
                    e.target.onerror = null;
                    e.target.src = 'https://placehold.co/600x400?text=No+Image';
                  }}
                />
            ) : (
                <span className="text-gray-500 font-bold text-xl">No Image</span>
            )}
          </div>
        </div>

        {/* ข้อมูลรายละเอียด */}
        <div className="w-full md:w-1/2 flex flex-col justify-center items-center md:items-end text-right h-full pt-10">
           <div className="space-y-4 text-gray-800 font-medium text-lg w-full">
              <p>สถานที่จัด : {market.location}</p>
              
              <p>วัน/เวลา : {market.date}</p>
              
              {market.contact && (
                <p>เบอร์ติดต่อ : {market.contact}</p>
              )}

              {/* แสดงรายละเอียดถ้ามี */}
              {market.description && (
                 <p className="text-gray-600 mt-4 text-sm md:text-base text-right border-t border-gray-300 pt-4">
                   "{market.description}"
                 </p>
              )}
              
              {market.mapLink && (
                <a 
                  href={market.mapLink} 
                  target="_blank" 
                  rel="noreferrer"
                  className="text-blue-600 font-bold underline decoration-1 underline-offset-4 block text-center md:text-right mt-4 hover:text-blue-800 transition-colors"
                >
                  เปิด Google Maps
                </a>
              )}
           </div>
           
           <div className="mt-20 w-full flex justify-center md:justify-end">
             <button
               onClick={() => navigate(-1)}
               className="bg-lime-500 hover:bg-lime-600 text-white py-2 px-12 rounded-full shadow-md transition-colors flex items-center gap-2 font-bold"
             >
               <span className="text-lg pb-1"></span> กลับ
             </button>
           </div>
        </div>
      </div>

    </div>
  );
};

export default MarketDetail;