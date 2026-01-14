// src/pages/AddListing.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

// --- ข้อมูลคงที่ (Static Data) ---
const COW_BREEDS = [
  "บราห์มัน (Brahman)", "ลูกผสมบราห์มัน", "ชาร์โรเลส์ (Charolais)", 
  "ลูกผสมชาร์โรเลส์", "ฮินดูบราซิล (Hindu Brazil)", "บีฟมาสเตอร์ (Beefmaster)", 
  "แองกัส (Angus)", "วากิว (Wagyu)", "กำแพงแสน", "ตาก", 
  "กบินทร์บุรี", "ไทยพื้นเมือง (Native)", "โฮลสไตน์ (วัวนม)", "อื่นๆ"
];

const THAI_PROVINCES = [
  "กรุงเทพมหานคร", "กระบี่", "กาญจนบุรี", "กาฬสินธุ์", "กำแพงเพชร", 
  "ขอนแก่น", "จันทบุรี", "ฉะเชิงเทรา", "ชลบุรี", "ชัยนาท", 
  "ชัยภูมิ", "ชุมพร", "เชียงราย", "เชียงใหม่", "ตรัง", 
  "ตราด", "ตาก", "นครนายก", "นครปฐม", "นครพนม", 
  "นครราชสีมา", "นครศรีธรรมราช", "นครสวรรค์", "นนทบุรี", "นราธิวาส", 
  "น่าน", "บึงกาฬ", "บุรีรัมย์", "ปทุมธานี", "ประจวบคีรีขันธ์", 
  "ปราจีนบุรี", "ปัตตานี", "พระนครศรีอยุธยา", "พะเยา", "พังงา", 
  "พัทลุง", "พิจิตร", "พิษณุโลก", "เพชรบุรี", "เพชรบูรณ์", 
  "แพร่", "ภูเก็ต", "มหาสารคาม", "มุกดาหาร", "แม่ฮ่องสอน", 
  "ยโสธร", "ยะลา", "ร้อยเอ็ด", "ระนอง", "ระยอง", 
  "ราชบุรี", "ลพบุรี", "ลำปาง", "ลำพูน", "เลย", 
  "ศรีสะเกษ", "สกลนคร", "สงขลา", "สตูล", "สมุทรปราการ", 
  "สมุทรสงคราม", "สมุทรสาคร", "สระแก้ว", "สระบุรี", "สิงห์บุรี", 
  "สุโขทัย", "สุพรรณบุรี", "สุราษฎร์ธานี", "สุรินทร์", "หนองคาย", 
  "หนองบัวลำภู", "อ่างทอง", "อำนาจเจริญ", "อุดรธานี", "อุตรดิตถ์", 
  "อุทัยธานี", "อุบลราชธานี"
];

const COMMON_VACCINES = [
  "ปากเท้าเปื่อย (FMD)", "คอเฮโมร์ (คอบวม)", "ลัมปี สกิน (LSD)",
  "แบลคเลก (โรคไข้ขา)", "แอนแทรกซ์ (กาลี)", "บรูเซลโลซิส (แท้งติดต่อ)",
  "ถ่ายพยาธิแล้ว" 
];

const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  const hour = h.toString().padStart(2, "0");
  TIME_OPTIONS.push(`${hour}:00`);
  TIME_OPTIONS.push(`${hour}:30`);
}
TIME_OPTIONS.push("23:59"); 

export default function AddListing() {
  const navigate = useNavigate();

  const [type, setType] = useState("cow"); 
  const [images, setImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);
  const [loading, setLoading] = useState(false);
  const [markets, setMarkets] = useState([]); 

  // Data State: วัว
  const [cow, setCow] = useState({
    name: "", gender: "", breed: "", age: "", weight: "", price: "", 
    location: "", sireName: "", marketId: "", vaccineHistory: "", description: "",
  });

  const [selectedVaccines, setSelectedVaccines] = useState([]);
  const [otherVaccine, setOtherVaccine] = useState("");

  // Data State: สินค้า (✅ เพิ่ม stock)
  const [product, setProduct] = useState({
    name: "", category: "medicine", price: "", description: "", stock: "1"
  });

  // Data State: ตลาดนัด
  const [market, setMarket] = useState({
    name: "", location: "", date: "", contact: "", description: "",
  });

  const [marketDays, setMarketDays] = useState([]);
  const [marketTime, setMarketTime] = useState({ open: "05:00", close: "12:00" });

  const DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

  // Handlers
  const toggleDay = (day) => {
    setMarketDays((prev) => prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]);
  };

  const toggleVaccine = (vac) => {
    setSelectedVaccines((prev) => prev.includes(vac) ? prev.filter(v => v !== vac) : [...prev, vac]);
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const res = await API.get("/markets");
        setMarkets(res.data);
      } catch (err) { console.error("Error fetching markets:", err); }
    };
    fetchMarkets();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    let url = "";

    if (type === "cow") {
      url = "/cows";
      let vaccineStr = selectedVaccines.join(", ");
      if (otherVaccine.trim()) vaccineStr += (vaccineStr ? ", " : "") + otherVaccine.trim();
      if (!vaccineStr) vaccineStr = "ไม่ระบุ";

      const finalCowData = { ...cow, vaccineHistory: vaccineStr };
      Object.entries(finalCowData).forEach(([k, v]) => formData.append(k, v));

    } else if (type === "product") {
      url = "/products";
      // ✅ ส่งข้อมูลสินค้ารวมถึง stock
      Object.entries(product).forEach(([k, v]) => formData.append(k, v));

    } else if (type === "market") {
      url = "/markets";
      let dateString = market.date; 
      if (marketDays.length > 0 && marketTime.open && marketTime.close) {
          const daysStr = marketDays.join(", ");
          dateString = `ทุกวัน${daysStr} เวลา ${marketTime.open} - ${marketTime.close} น.`;
      }
      const finalMarketData = { ...market, date: dateString };
      Object.entries(finalMarketData).forEach(([k, v]) => formData.append(k, v));
    }

    images.forEach((img) => formData.append("images", img));

    try {
      await API.post(url, formData);
      alert("บันทึกรายการสำเร็จ!");
      navigate(type === "market" ? "/market" : type === "product" ? "/products" : "/");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-black px-6 py-5 text-center">
          <h1 className="text-2xl font-bold text-white">ลงประกาศขายใหม่</h1>
          <p className="text-gray-400 text-sm mt-1">เลือกประเภทสินค้าที่ต้องการลงประกาศ</p>
        </div>

        {/* Type Selector */}
        <div className="bg-gray-100 p-2 flex justify-center gap-2 border-b border-gray-200">
          <button type="button" onClick={() => setType("cow")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === "cow" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>วัว</button>
          <button type="button" onClick={() => setType("product")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === "product" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>สินค้าอื่น ๆ</button>
          <button type="button" onClick={() => setType("market")} className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all ${type === "market" ? "bg-white text-black shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}>ตลาดนัด</button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* --- Form Cow --- */}
          {type === "cow" && (
            <>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">ชื่อวัว</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500" value={cow.name} onChange={(e) => setCow({ ...cow, name: e.target.value })} required />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">เพศ</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-green-500 focus:border-green-500" value={cow.gender} onChange={(e) => setCow({ ...cow, gender: e.target.value })}>
                    <option value="">-- เลือกเพศ --</option>
                    <option value="ผู้">♂ ผู้</option>
                    <option value="เมีย">♀ เมีย</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">พันธุ์</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-green-500 focus:border-green-500" value={cow.breed} onChange={(e) => setCow({ ...cow, breed: e.target.value })}>
                    <option value="">-- เลือกสายพันธุ์ --</option>
                    {COW_BREEDS.map((breed) => (<option key={breed} value={breed}>{breed}</option>))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">ชื่อพ่อพันธุ์ / น้ำเชื้อ (ถ้ามี)</label>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500" placeholder="เช่น SK520, H409, เจ้าแดง..." value={cow.sireName} onChange={(e) => setCow({ ...cow, sireName: e.target.value })} />
              </div>

              {/* Vaccine Selection */}
              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <label className="block mb-3 text-sm font-bold text-gray-800">
                    ประวัติการฉีดวัคซีน / ถ่ายพยาธิ
                </label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {COMMON_VACCINES.map((vac) => (
                        <button key={vac} type="button" onClick={() => toggleVaccine(vac)} className={`px-3 py-1.5 text-sm rounded-full border transition-all ${selectedVaccines.includes(vac) ? "bg-blue-600 text-white border-blue-600 shadow-sm" : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"}`}>
                            {selectedVaccines.includes(vac) ? "✓ " : ""}{vac}
                        </button>
                    ))}
                </div>
                <input className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-green-500 focus:border-green-500" placeholder="ระบุเพิ่มเติม (ถ้ามี)..." value={otherVaccine} onChange={(e) => setOtherVaccine(e.target.value)} />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div><label className="block mb-2 text-sm font-bold text-gray-700">อายุ (ปี)</label><input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500" value={cow.age} onChange={(e) => setCow({ ...cow, age: e.target.value })} /></div>
                <div><label className="block mb-2 text-sm font-bold text-gray-700">น้ำหนัก (กก.)</label><input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500" value={cow.weight} onChange={(e) => setCow({ ...cow, weight: e.target.value })} /></div>
                <div><label className="block mb-2 text-sm font-bold text-gray-700">ราคา (บาท)</label><input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-bold text-green-600 focus:ring-green-500 focus:border-green-500" value={cow.price} onChange={(e) => setCow({ ...cow, price: e.target.value })} required /></div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">จังหวัด / สถานที่</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-green-500 focus:border-green-500" value={cow.location} onChange={(e) => setCow({ ...cow, location: e.target.value })}>
                  <option value="">-- เลือกจังหวัด --</option>
                  {THAI_PROVINCES.map((province) => (<option key={province} value={province}>{province}</option>))}
                </select>
              </div>
              
              {markets.length > 0 && (
                <div>
                  <label className="block mb-2 text-sm font-bold text-gray-700">นำไปขายที่ตลาดนัด (ถ้ามี)</label>
                  <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-green-500 focus:border-green-500" value={cow.marketId} onChange={(e) => setCow({ ...cow, marketId: e.target.value })}>
                    <option value="">-- ไม่ระบุ / ขายที่บ้าน --</option>
                    {markets.map((m) => (<option key={m.id} value={m.id}>{m.name} (จ.{m.location})</option>))}
                  </select>
                </div>
              )}

              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">ลักษณะ / รายละเอียดเพิ่มเติม</label>
                <textarea rows="4" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500" value={cow.description} onChange={(e) => setCow({ ...cow, description: e.target.value })}></textarea>
              </div>
            </>
          )}

          {/* --- Form Product --- */}
          {type === "product" && (
            <>
              <div><label className="block mb-2 text-sm font-bold text-gray-700">ชื่อสินค้า</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} required /></div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="block mb-2 text-sm font-bold text-gray-700">หมวดหมู่</label><select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-green-500 focus:border-green-500" value={product.category} onChange={(e) => setProduct({ ...product, category: e.target.value })}><option value="medicine">ยา</option><option value="supplement">อาหารเสริม</option><option value="equipment">อุปกรณ์</option><option value="other">อื่นๆ</option></select></div>
                <div><label className="block mb-2 text-sm font-bold text-gray-700">ราคา (บาท)</label><input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-bold text-green-600 focus:ring-green-500 focus:border-green-500" value={product.price} onChange={(e) => setProduct({ ...product, price: e.target.value })} required /></div>
              </div>

              {/* ✅ เพิ่มช่องกรอกจำนวนสินค้า (Stock) */}
              <div>
                 <label className="block mb-2 text-sm font-bold text-gray-700">จำนวนสินค้าในคลัง (Stock)</label>
                 <input 
                    type="number" 
                    min="1"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500" 
                    value={product.stock} 
                    onChange={(e) => setProduct({ ...product, stock: e.target.value })} 
                    required 
                 />
              </div>

              <div><label className="block mb-2 text-sm font-bold text-gray-700">รายละเอียดสินค้า</label><textarea rows="4" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500" value={product.description} onChange={(e) => setProduct({ ...product, description: e.target.value })}></textarea></div>
            </>
          )}

          {/* --- Form Market --- */}
          {type === "market" && (
            <>
              <div><label className="block mb-2 text-sm font-bold text-gray-700">ชื่อตลาดนัด</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500" placeholder="เช่น ตลาดนัดโคกระบือบ้านหัน" value={market.name} onChange={(e) => setMarket({ ...market, name: e.target.value })} required /></div>
              <div>
                <label className="block mb-2 text-sm font-bold text-gray-700">สถานที่ตั้ง</label>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-green-500 focus:border-green-500" value={market.location} onChange={(e) => setMarket({ ...market, location: e.target.value })}>
                  <option value="">-- เลือกจังหวัด --</option>
                  {THAI_PROVINCES.map((province) => (<option key={province} value={province}>{province}</option>))}
                </select>
              </div>

              <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
                <label className="block mb-3 text-sm font-bold text-gray-800">วันเปิดทำการ</label>
                <div className="flex flex-wrap gap-2 mb-4">
                  {DAYS.map((day) => (
                    <button key={day} type="button" onClick={() => toggleDay(day)} className={`px-3 py-1.5 text-sm rounded-full border transition-all ${marketDays.includes(day) ? "bg-green-500 text-white border-green-500 shadow-sm" : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"}`}>
                      {day}
                    </button>
                  ))}
                </div>

                <div className="flex gap-4 items-center">
                    <div className="flex-1">
                        <label className="block mb-1 text-xs font-bold text-gray-600">เวลาเปิด</label>
                        <select className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white" value={marketTime.open} onChange={(e) => setMarketTime({...marketTime, open: e.target.value})}>
                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t} น.</option>)}
                        </select>
                    </div>
                    <span className="text-gray-400 mt-4">-</span>
                    <div className="flex-1">
                        <label className="block mb-1 text-xs font-bold text-gray-600">เวลาปิด</label>
                        <select className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm bg-white" value={marketTime.close} onChange={(e) => setMarketTime({...marketTime, close: e.target.value})}>
                            {TIME_OPTIONS.map(t => <option key={t} value={t}>{t} น.</option>)}
                        </select>
                    </div>
                </div>
                {marketDays.length > 0 && <p className="text-xs text-green-600 mt-3 font-medium bg-green-50 p-2 rounded">สรุป: ทุกวัน{marketDays.join(", ")} เวลา {marketTime.open} - {marketTime.close} น.</p>}
              </div>

              <div><label className="block mb-2 text-sm font-bold text-gray-700">เบอร์โทรติดต่อ</label><input className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500" placeholder="08x-xxx-xxxx" value={market.contact} onChange={(e) => setMarket({ ...market, contact: e.target.value })} /></div>
              <div><label className="block mb-2 text-sm font-bold text-gray-700">รายละเอียด / กฎระเบียบ</label><textarea rows="4" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500" placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับตลาด..." value={market.description} onChange={(e) => setMarket({ ...market, description: e.target.value })}></textarea></div>
            </>
          )}

          {/* Image Upload - UI Update */}
          <div className="pt-4 border-t border-gray-200">
            <label className="block mb-2 text-sm font-bold text-gray-700">รูปภาพประกอบ</label>
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg className="w-8 h-8 mb-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                        </svg>
                        <p className="text-sm text-gray-500"><span className="font-semibold">คลิกเพื่ออัปโหลด</span> หรือลากไฟล์มาวาง</p>
                    </div>
                    <input type="file" className="hidden" multiple onChange={handleImageChange} />
                </label>
            </div>
            
            {imagePreview.length > 0 && (
                <div className="mt-4 flex gap-2 overflow-x-auto p-1">
                    {imagePreview.map((src, idx) => (
                        <img key={idx} src={src} alt="preview" className="h-20 w-20 object-cover rounded-lg border border-gray-300" />
                    ))}
                </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => navigate(-1)} className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-300 transition-colors">ยกเลิก</button>
            <button type="submit" disabled={loading} className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-200">{loading ? "กำลังบันทึก..." : "บันทึกรายการ"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}