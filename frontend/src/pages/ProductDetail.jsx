// src/pages/ProductDetail.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../services/api";

const API_URL = "http://localhost:5000";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // State รูปภาพ
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // State สำหรับปุ่ม Next/Prev Product (เปลี่ยนสินค้า)
  const [prevId, setPrevId] = useState(null);
  const [nextId, setNextId] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await API.get('/products');
        const allProducts = res.data || [];
        
        // ค้นหาสินค้าปัจจุบัน
        const foundProduct = allProducts.find(p => p.id.toString() === id.toString());
        
        if (foundProduct) {
          setProduct(foundProduct);
          setCurrentImageIndex(0);

          // หา ID ก่อนหน้า / ถัดไป
          const currentIndex = allProducts.findIndex(p => p.id.toString() === id.toString());
          
          if (currentIndex !== -1) {
             if (currentIndex > 0) setPrevId(allProducts[currentIndex - 1].id);
             else setPrevId(null);
             
             if (currentIndex < allProducts.length - 1) setNextId(allProducts[currentIndex + 1].id);
             else setNextId(null);
          }
        } else {
          setProduct(null);
        }

      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const images = product?.images && product.images.length > 0 ? product.images : [];
  
  const getImageUrl = (path) => {
    if (!path) return "https://via.placeholder.com/400x300?text=No+Image";
    if (path.startsWith("http")) return path;
    return `${API_URL}${path}`;
  };

  // ✅ ฟังก์ชันเลื่อนรูปภาพ (มี stopPropagation เพื่อไม่ให้ตีกับ event อื่น)
  const nextImage = (e) => {
    e?.stopPropagation();
    if (images.length > 0) setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    if (images.length > 0) setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <span className="text-gray-500 animate-pulse">กำลังโหลดข้อมูลสินค้า...</span>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 gap-4">
        <p className="text-red-500 font-bold text-xl">ไม่พบข้อมูลสินค้า</p>
        <button onClick={() => navigate('/products')} className="px-6 py-2 bg-gray-800 text-white rounded-full hover:bg-black transition">
            กลับหน้าสินค้า
        </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans pb-20">
      
      {/* Header */}
      <header className="pt-10 pb-6 text-center">
        <h1 className="text-3xl font-extrabold mb-2 text-gray-800">รายละเอียดสินค้า</h1>
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-28 bg-gray-300" />
          <span className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Product Details</span>
          <span className="h-px w-28 bg-gray-300" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[90rem] mx-auto px-4 flex items-center justify-center gap-6">
        
        {/* ⬅️ ปุ่มเปลี่ยนสินค้า (ก่อนหน้า) */}
        <div className="hidden xl:block w-16 text-right">
           {prevId ? (
             <button 
                onClick={() => navigate(`/products/${prevId}`)} 
                className="group bg-white hover:bg-green-500 hover:text-white text-gray-400 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-110 focus:outline-none"
                title="สินค้าก่อนหน้า"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
             </button>
           ) : <div className="w-14 h-14" />}
        </div>

        {/* --- Card --- */}
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row max-w-5xl w-full">
          
          {/* ✅ ส่วนรูปภาพ + ซูม + ลูกศรเลื่อนรูป */}
          <div className="w-full md:w-1/2 bg-gray-100 relative h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden group">
            
            {/* รูปภาพ (Zoom Effect) */}
            <img 
              src={getImageUrl(images[currentImageIndex])} 
              alt={product.name} 
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 cursor-zoom-in"
            />
            
            {/* ✅ ปุ่มลูกศรเลื่อนรูป (ซ้อนทับบนรูป) */}
            {images.length > 1 && (
              <>
                {/* ลูกศรซ้าย */}
                <button 
                  onClick={prevImage} 
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-3 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 transform -translate-x-4 group-hover:translate-x-0 focus:outline-none z-20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                
                {/* ลูกศรขวา */}
                <button 
                  onClick={nextImage} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-black p-3 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 focus:outline-none z-20"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </button>
                
                {/* เลขหน้า (Counter) */}
                <div className="absolute bottom-20 right-4 bg-black/60 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md z-10 pointer-events-none select-none">
                  {currentImageIndex + 1} / {images.length}
                </div>
              </>
            )}

            {/* Gallery Thumbnails (ด้านล่าง) */}
            {images.length > 1 && (
               <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 p-2 bg-gradient-to-t from-black/50 to-transparent z-10">
                 {images.map((img, idx) => (
                   <button 
                     key={idx} 
                     onClick={() => setCurrentImageIndex(idx)}
                     className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${currentImageIndex === idx ? 'border-green-400 scale-110 shadow-md' : 'border-white/70 opacity-80 hover:opacity-100'}`}
                   >
                     <img src={getImageUrl(img)} className="w-full h-full object-cover" alt="thumb" />
                   </button>
                 ))}
               </div>
            )}
          </div>

          {/* รายละเอียดสินค้า */}
          <div className="w-full md:w-1/2 p-8 md:p-10 flex flex-col">
             <div className="mb-4">
                <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                  {product.category || "สินค้าทั่วไป"}
                </span>
             </div>
             
             <h2 className="text-3xl font-bold text-gray-800 mb-2">{product.name}</h2>
             <p className="text-4xl font-extrabold text-green-600 mb-6 flex items-end gap-2">
               {Number(product.price).toLocaleString()} <span className="text-lg text-gray-400 font-medium mb-1">บาท</span>
             </p>

             <div className="prose prose-sm text-gray-600 mb-8 bg-gray-50 p-6 rounded-2xl border border-gray-100 h-full overflow-y-auto max-h-60 custom-scrollbar">
                <h3 className="text-gray-900 font-bold mb-2">รายละเอียดเพิ่มเติม</h3>
                <p className="leading-relaxed">{product.description || "ไม่มีรายละเอียดสินค้า"}</p>
             </div>

             <div className="mt-auto flex gap-3">
               <button onClick={() => navigate(-1)} className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold transition">
                 ← กลับ
               </button>
               <button 
                 onClick={() => navigate('/place-order', { state: { product: product } })} 
                 className="flex-[2] px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition flex items-center justify-center gap-2"
               >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                 สนใจสั่งซื้อ
               </button>
             </div>
          </div>
        </div>

        {/* ➡️ ปุ่มเปลี่ยนสินค้า (ถัดไป) */}
        <div className="hidden xl:block w-16 text-left">
           {nextId ? (
             <button 
                onClick={() => navigate(`/products/${nextId}`)} 
                className="group bg-white hover:bg-green-500 hover:text-white text-gray-400 rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-all hover:scale-110 focus:outline-none"
                title="สินค้าถัดไป"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
             </button>
           ) : <div className="w-14 h-14" />}
        </div>

      </main>
    </div>
  );
}