// src/pages/Home.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";

const API_URL = "http://localhost:5000";

export default function Home() {
  const [cows, setCows] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchCows = async () => {
      try {
        const res = await API.get("/cows");
        // กรองเฉพาะที่อนุมัติแล้ว
        const approvedCows = (res.data || []).filter(c => c.status === 'approved');
        setCows(approvedCows);
        setCurrent(0);
      } catch (err) {
        console.error(err);
      }
    };
    fetchCows();
  }, []);

  const nextSlide = () => {
    if (cows.length === 0) return;
    setCurrent((prev) => (prev + 1) % cows.length);
  };

  const prevSlide = () => {
    if (cows.length === 0) return;
    setCurrent((prev) => (prev - 1 + cows.length) % cows.length);
  };

  // ฟังก์ชันคำนวณ index ของตัวซ้าย (ก่อนหน้า) และ ตัวขวา (ถัดไป)
  const getPrevIndex = () => (current - 1 + cows.length) % cows.length;
  const getNextIndex = () => (current + 1) % cows.length;

  if (cows.length === 0) {
    return (
      <div className="w-full min-h-screen bg-gray-100 font-sans flex items-center justify-center">
        <p className="text-gray-400 text-lg">ยังไม่มีรายการวัวที่อนุมัติแล้ว</p>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-100 font-sans">
      
      {/* === Carousel Section === */}
      <section className="bg-white border-b border-gray-200 shadow-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-12">
          
          <div className="relative flex items-center justify-center h-[500px]">
            
            {/* --- 1. การ์ดด้านซ้าย (ตัวก่อนหน้า) --- */}
            {/* ใส่ในกรอบสีแดงด้านซ้าย: แสดงรูปตัวก่อนหน้าแบบจางๆ */}
            {cows.length > 1 && (
              <div 
                className="absolute left-0 md:left-10 transform scale-90 opacity-40 blur-[1px] hover:opacity-60 transition cursor-pointer hidden md:block z-10"
                onClick={prevSlide}
              >
                <div className="w-[300px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <img 
                    src={cows[getPrevIndex()].images?.[0] ? `${API_URL}${cows[getPrevIndex()].images[0]}` : "https://via.placeholder.com/300"} 
                    className="w-full h-[250px] object-cover grayscale"
                    alt="prev"
                  />
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-gray-500">{cows[getPrevIndex()].name}</h3>
                  </div>
                </div>
              </div>
            )}

            {/* --- 2. การ์ดตรงกลาง (ตัวหลัก) --- */}
            <div className="relative z-20 w-full max-w-sm md:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white transform transition-all duration-500">
                {/* รูปภาพ */}
                <div className="relative h-[300px] group overflow-hidden">
                    <Link to={`/cows/${cows[current].id}`}>
                        <img
                            src={cows[current].images?.[0] ? `${API_URL}${cows[current].images[0]}` : "https://via.placeholder.com/400"}
                            alt={cows[current].name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                    </Link>
                    <div className="absolute top-4 right-4 bg-green-600 text-white px-4 py-1 rounded-full font-bold shadow-md">
                        {Number(cows[current].price).toLocaleString()} ฿
                    </div>
                </div>

                {/* ข้อมูล */}
                <div className="p-6 text-center">
                    <h2 className="text-3xl font-extrabold text-gray-800 mb-1">{cows[current].name}</h2>
                    <p className="text-gray-500 text-sm mb-4 font-medium bg-gray-100 inline-block px-3 py-1 rounded-full">
                        📍 จ.{cows[current].location} | พันธุ์: {cows[current].breed}
                    </p>
                    
                    <div className="flex justify-center gap-4 mt-2">
                        {/* ปุ่มกดเลื่อนซ้าย */}
                        <button onClick={prevSlide} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>
                        
                        <Link
                            to={`/cows/${cows[current].id}`}
                            className="flex-1 bg-black text-white py-2 rounded-full font-bold hover:bg-gray-800 transition shadow-lg flex items-center justify-center gap-2"
                        >
                            ดูรายละเอียด
                        </Link>

                        {/* ปุ่มกดเลื่อนขวา */}
                        <button onClick={nextSlide} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                            <svg className="w-6 h-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* --- 3. การ์ดด้านขวา (ตัวถัดไป) --- */}
            {/* ใส่ในกรอบสีแดงด้านขวา: แสดงรูปตัวถัดไปแบบจางๆ */}
            {cows.length > 1 && (
              <div 
                className="absolute right-0 md:right-10 transform scale-90 opacity-40 blur-[1px] hover:opacity-60 transition cursor-pointer hidden md:block z-10"
                onClick={nextSlide}
              >
                <div className="w-[300px] bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                  <img 
                    src={cows[getNextIndex()].images?.[0] ? `${API_URL}${cows[getNextIndex()].images[0]}` : "https://via.placeholder.com/300"} 
                    className="w-full h-[250px] object-cover grayscale"
                    alt="next"
                  />
                  <div className="p-4 text-center">
                    <h3 className="font-bold text-gray-500">{cows[getNextIndex()].name}</h3>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </section>

      {/* === Info Section === */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 relative inline-block">
            ยินดีต้อนรับสู่ Cow Market
            <span className="absolute bottom-0 left-0 w-full h-1 bg-green-500 rounded-full"></span>
          </h2>
          
          <p className="text-gray-600 mb-10 text-lg leading-relaxed max-w-2xl mx-auto">
            ตลาดซื้อขายวัวออนไลน์ที่ทันสมัยที่สุด เชื่อมต่อเกษตรกรทั่วไทย
            ซื้อ-ขายวัวคุณภาพดี สะดวก ปลอดภัย และเชื่อถือได้
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left max-w-3xl mx-auto">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <h3 className="font-bold text-gray-800">ค้นหาง่าย</h3>
              </div>
              <p className="text-gray-500 text-sm pl-11">ระบบค้นหาที่ละเอียด คัดกรองได้ทั้งราคา สายพันธุ์ และจังหวัด</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-bold text-gray-800">เชื่อถือได้</h3>
              </div>
              <p className="text-gray-500 text-sm pl-11">ข้อมูลผู้ขายชัดเจน มีระบบยืนยันตัวตนเบื้องต้น</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-yellow-100 p-2 rounded-full text-yellow-600">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <h3 className="font-bold text-gray-800">ข้อมูลครบถ้วน</h3>
              </div>
              <p className="text-gray-500 text-sm pl-11">รายละเอียดทั้งอายุ น้ำหนัก พ่อพันธุ์ และประวัติวัคซีน</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
              <div className="bg-purple-100 p-2 rounded-full text-purple-600 w-10 h-10 flex items-center justify-center mr-3">
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
              </div>
              <div>
                 <h3 className="font-bold text-gray-800">ติดต่อโดยตรง</h3>
                 <p className="text-gray-500 text-sm mt-1">คุยกับเจ้าของวัวได้เลย ไม่ผ่านนายหน้า ไม่มีค่าธรรมเนียม</p>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}