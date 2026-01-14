// src/pages/CowsPage.jsx
import { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; // ✅ ใช้ Link และ useNavigate
import API from "../services/api";

// --- Component ย่อยสำหรับทำ Slider แนวนอน ---
const ScrollableSection = ({ title, items, type }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 300; // ระยะการเลื่อน
      current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (items.length === 0) return null;

  return (
    <section className="bg-white/60 rounded-2xl py-6 px-3 relative group">
      {/* Header ของ Section */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-4 mb-1">
          <span className="h-px w-20 bg-black" />
          <span className="font-bold text-lg">{title}</span>
          <span className="h-px w-20 bg-black" />
        </div>
        <p className="font-semibold text-sm text-gray-500 uppercase">Cow market</p>
      </div>

      {/* Container ของ Slider */}
      <div className="relative px-2 md:px-10">
        
        {/* ปุ่มลูกศรซ้าย */}
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white text-gray-600 p-2 rounded-full shadow-lg hover:bg-green-500 hover:text-white transition-all hidden md:flex items-center justify-center -ml-4 w-10 h-10 border border-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        {/* รายการสินค้า (Scrollable Area) */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x snap-mandatory"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // ซ่อน Scrollbar
        >
          {items.map((item) => (
            <ItemCard key={item.id} item={item} type={type} />
          ))}
        </div>

        {/* ปุ่มลูกศรขวา */}
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white text-gray-600 p-2 rounded-full shadow-lg hover:bg-green-500 hover:text-white transition-all hidden md:flex items-center justify-center -mr-4 w-10 h-10 border border-gray-100"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>
    </section>
  );
};

// --- Component การ์ดสินค้า ---
const ItemCard = ({ item, type }) => {
  const navigate = useNavigate();
  
  // กำหนดเส้นทาง: ถ้าเป็น 'cow' ไป /cows/id ถ้าไม่ใช่ ไป /products/id
  const detailPath = type === 'cow' ? `/cows/${item.id}` : `/products/${item.id}`;

  return (
    <div className="bg-white rounded-xl shadow p-3 text-center text-xs min-w-[160px] md:min-w-[200px] snap-start flex flex-col hover:shadow-lg transition-shadow duration-300">
      <div className="w-full h-32 bg-gray-200 rounded mb-2 overflow-hidden relative">
        {item.images?.[0] ? (
          <img
            src={`http://localhost:5000${item.images[0]}`}
            alt={item.name}
            className="w-full h-full object-cover transition-transform hover:scale-110 duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
        )}
      </div>
      
      <p className="font-semibold mb-1 truncate px-1 text-sm">{item.name}</p>
      
      <div className="mt-auto">
        {item.price != null && (
          <p className="text-green-600 font-bold text-sm">
            {Number(item.price).toLocaleString()} บาท
          </p>
        )}
        <button 
          onClick={() => navigate(detailPath)}
          className="mt-2 px-4 py-1.5 rounded-full bg-green-500 text-white text-xs hover:bg-green-600 transition w-full"
        >
          รายละเอียด
        </button>
      </div>
    </div>
  );
};

// --- Main Page Component ---
export default function CowsPage() {
  const [cows, setCows] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cowRes, prodRes] = await Promise.all([
          API.get("/cows"),
          API.get("/products"),
        ]);
        setCows(cowRes.data || []);
        setProducts(prodRes.data || []);
      } catch (err) {
        console.error("LOAD LIST ERROR:", err.response || err);
      }
    };
    load();
  }, []);

  const medicines = products.filter((p) => p.category === "medicine");
  const supplements = products.filter((p) => p.category === "supplement");
  const others = products.filter((p) => p.category === "other" || !p.category);

  return (
    <div className="min-h-screen bg-gray-200 py-8 font-sans">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-4 mb-2">
          <div className="h-px w-20 bg-gray-300"></div>
          <h1 className="font-bold text-lg text-gray-800">สินค้า</h1>
          <div className="h-px w-20 bg-gray-300"></div>
        </div>
        <p className="font-semibold text-sm text-gray-500 uppercase">Cow market</p>
      </div>

      <div className="max-w-6xl mx-auto space-y-10 px-4">
        {/* เรียกใช้ ScrollableSection แทนการเขียนซ้ำ */}
        <ScrollableSection title="รายการ วัว" items={cows} type="cow" />
        <ScrollableSection title="ยารักษาโรค" items={medicines} type="product" />
        <ScrollableSection title="อาหารเสริม" items={supplements} type="product" />
        <ScrollableSection title="สินค้าอื่น ๆ" items={others} type="product" />
      </div>
    </div>
  );
}