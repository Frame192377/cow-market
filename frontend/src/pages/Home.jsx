import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import Nav from "../components/Nav";

export default function Home({ user }) {
  const [cows, setCows] = useState([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchCows = async () => {
      try {
        const res = await API.get("/cows");
        setCows(res.data || []);
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

  const currentCow = cows[current];

  return (
    <div className="w-full min-h-screen bg-gray-100">
      

      {/* === Carousel === */}
      <section className="bg-gray-200 border-t border-blue-300">
        <div className="max-w-4xl mx-auto px-4 py-10">

          {cows.length > 0 && currentCow ? (
            <div className="relative bg-gray-100 rounded-lg shadow-lg py-8 flex flex-col items-center">
              
              {/* Left Arrow */}
              <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl px-2 py-1 hover:scale-110 transition"
              >
                ❮
              </button>

              {/* Right Arrow */}
              <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-4xl px-2 py-1 hover:scale-110 transition"
              >
                ❯
              </button>

              {/* Image (ลดขนาดลงตามที่ขอ) */}
              <div className="w-full flex justify-center">
                <img
                  src={
                    currentCow.images?.[0]
                      ? `http://localhost:5000${currentCow.images[0]}`
                      : "https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800"
                  }
                  alt={currentCow.name}
                  className="
                    w-full 
                    max-w-xl 
                    h-44 
                    sm:h-52 
                    md:h-56 
                    lg:h-60 
                    object-contain 
                    rounded-md 
                    shadow
                  "
                />
              </div>

              {/* Info */}
              <div className="mt-6 text-center">
                <h2 className="text-lg sm:text-xl font-bold mb-1">{currentCow.name}</h2>

                <p className="text-xl sm:text-2xl font-bold text-green-600 mb-4">
                  {currentCow.price?.toLocaleString()} บาท
                </p>

                <Link
                  to={`/cows/${currentCow.id}`}
                  className="bg-green-500 hover:bg-green-600 text-white px-8 py-2 rounded-full font-semibold inline-block"
                >
                  รายละเอียด
                </Link>
              </div>

            </div>
          ) : (
            <p className="text-center text-gray-600 py-10">ยังไม่มีข้อมูลวัวในระบบ</p>
          )}

        </div>
      </section>

      {/* Info Section */}
      <div className="bg-gray-200 py-12">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-3 border-b-2 border-gray-400 pb-2 inline-block">
            ยินดีต้อนรับสู่ Cow Market
          </h2>
          <p className="text-gray-700 mb-6 text-sm leading-relaxed">
            ตลาดซื้อขายวัวออนไลน์ที่ใหญ่ที่สุดสำหรับเกษตรกรและผู้สนใจทุกคน
            ซื้อ-ขายวัวคุณภาพสูงจากทั่วประเทศได้สะดวกและรวดเร็ว
          </p>
          <ul className="text-left text-sm text-gray-700 space-y-2 max-w-2xl mx-auto">
            <li>• ระบบค้นหาวัวง่ายและสะดวก</li>
            <li>• ข้อมูลครบถ้วนทั้งสายพันธุ์ อายุ น้ำหนัก สุขภาพ</li>
            <li>• ผู้ขายทุกคนผ่านการตรวจสอบ</li>
            <li>• ติดต่อสื่อสารกับผู้ขายโดยตรง ไม่มีค่าธรรมเนียมแอบแฝง</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
