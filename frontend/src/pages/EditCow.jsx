// src/pages/EditCow.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

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

// ✅ รายการวัคซีน (ต้องตรงกับหน้า Add)
const COMMON_VACCINES = [
  "ปากเท้าเปื่อย (FMD)",
  "คอเฮโมร์ (คอบวม)",
  "ลัมปี สกิน (LSD)",
  "แบลคเลก (โรคไข้ขา)",
  "แอนแทรกซ์ (กาลี)",
  "บรูเซลโลซิส (แท้งติดต่อ)",
  "ถ่ายพยาธิแล้ว" 
];

export default function EditCow() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [markets, setMarkets] = useState([]);

  // State เก็บข้อมูลวัว
  const [cow, setCow] = useState({
    name: "",
    gender: "",
    breed: "",
    age: "",
    weight: "",
    price: "",
    location: "",
    sireName: "", 
    marketId: "",
    description: "",
  });

  // ✅ State สำหรับระบบวัคซีน (แยกออกมาเพื่อจัดการ UI)
  const [selectedVaccines, setSelectedVaccines] = useState([]);
  const [otherVaccine, setOtherVaccine] = useState("");
  
  const [newImages, setNewImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  // โหลดข้อมูล
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cowRes, marketRes] = await Promise.all([
          API.get(`/cows/${id}`),
          API.get("/markets")
        ]);

        const c = cowRes.data;
        setCow({
          name: c.name || "",
          gender: c.gender || "",
          breed: c.breed || "",
          age: c.age || "",
          weight: c.weight || "",
          price: c.price || "",
          location: c.location || "",
          sireName: c.sireName || "",
          marketId: c.marketId || "",
          description: c.description || "",
        });

        // ✅ Logic แปลง String กลับเป็นปุ่ม (Reverse Engineering)
        if (c.vaccineHistory) {
          const parts = c.vaccineHistory.split(",").map(s => s.trim()).filter(s => s !== "");
          const found = [];
          const others = [];

          parts.forEach(part => {
            if (COMMON_VACCINES.includes(part)) {
              found.push(part);
            } else if (part !== "ไม่ระบุ") {
              others.push(part);
            }
          });

          setSelectedVaccines(found);
          setOtherVaccine(others.join(", "));
        }

        setMarkets(marketRes.data);

      } catch (err) {
        console.error("Error fetching data:", err);
        alert("ไม่พบข้อมูล หรือคุณไม่มีสิทธิ์แก้ไข");
        navigate("/cows");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, navigate]);

  // ฟังก์ชันกดเลือกวัคซีน
  const toggleVaccine = (vac) => {
    setSelectedVaccines((prev) => 
        prev.includes(vac) 
        ? prev.filter(v => v !== vac) 
        : [...prev, vac]
    );
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImages(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreview(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();

    // ✅ รวมข้อมูลวัคซีนกลับเป็น String เดียว
    let vaccineStr = selectedVaccines.join(", ");
    if (otherVaccine.trim()) {
        vaccineStr += (vaccineStr ? ", " : "") + otherVaccine.trim();
    }
    if (!vaccineStr) vaccineStr = "ไม่ระบุ";

    // รวมข้อมูลลง FormData
    const finalCowData = { ...cow, vaccineHistory: vaccineStr };
    Object.entries(finalCowData).forEach(([key, value]) => {
        formData.append(key, value);
    });

    newImages.forEach((img) => formData.append("images", img));

    try {
      await API.put(`/cows/${id}`, formData);
      alert("แก้ไขข้อมูลสำเร็จ!");
      navigate(`/cows/${id}`);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการแก้ไข");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center pt-20">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center py-10 px-4 font-sans">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-green-600 px-6 py-4 text-center">
            <h1 className="text-2xl font-bold text-white">แก้ไขข้อมูลวัว</h1>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* ชื่อวัว */}
          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">ชื่อวัว</label>
            <input
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500"
              value={cow.name}
              onChange={(e) => setCow({ ...cow, name: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">เพศ</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-green-500 focus:border-green-500"
                value={cow.gender}
                onChange={(e) => setCow({ ...cow, gender: e.target.value })}
              >
                <option value="">-- เลือกเพศ --</option>
                <option value="ผู้">♂ ผู้</option>
                <option value="เมีย">♀ เมีย</option>
              </select>
            </div>

            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">พันธุ์</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-green-500 focus:border-green-500"
                value={cow.breed}
                onChange={(e) => setCow({ ...cow, breed: e.target.value })}
              >
                <option value="">-- เลือกสายพันธุ์ --</option>
                {COW_BREEDS.map((breed) => (
                  <option key={breed} value={breed}>{breed}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
             <label className="block mb-2 text-sm font-bold text-gray-700">
             ชื่อพ่อพันธุ์ / น้ำเชื้อ
             </label>
             <input
               className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500"
               value={cow.sireName}
               onChange={(e) => setCow({ ...cow, sireName: e.target.value })}
               placeholder="เช่น SK520"
             />
          </div>

          {/* ✅ ส่วนเลือกวัคซีน (UI เหมือนหน้า AddListing) */}
          <div className="bg-gray-50 p-5 rounded-xl border border-gray-200">
             <label className="block mb-3 text-sm font-bold text-gray-800">
                 ประวัติการฉีดวัคซีน / ถ่ายพยาธิ (แก้ไข)
             </label>
             
             <div className="flex flex-wrap gap-2 mb-3">
                 {COMMON_VACCINES.map((vac) => (
                     <button
                         key={vac}
                         type="button"
                         onClick={() => toggleVaccine(vac)}
                         className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                             selectedVaccines.includes(vac)
                             ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                             : "bg-white text-gray-600 border-gray-300 hover:border-blue-400"
                         }`}
                     >
                         {selectedVaccines.includes(vac) ? "✓ " : ""}{vac}
                     </button>
                 ))}
             </div>

             <div>
                 <input 
                     className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                     placeholder="ระบุเพิ่มเติม (ถ้ามี) เช่น ฉีดเมื่อเดือนที่แล้ว..."
                     value={otherVaccine}
                     onChange={(e) => setOtherVaccine(e.target.value)}
                 />
             </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">อายุ (ปี)</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500"
                value={cow.age} onChange={(e) => setCow({ ...cow, age: e.target.value })} />
            </div>
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">น้ำหนัก (กก.)</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500"
                value={cow.weight} onChange={(e) => setCow({ ...cow, weight: e.target.value })} />
            </div>
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">ราคา (บาท)</label>
              <input type="number" className="w-full border border-gray-300 rounded-lg px-3 py-2.5 font-bold text-green-600 focus:ring-green-500 focus:border-green-500"
                value={cow.price} onChange={(e) => setCow({ ...cow, price: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">จังหวัด / สถานที่</label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-green-500 focus:border-green-500"
              value={cow.location}
              onChange={(e) => setCow({ ...cow, location: e.target.value })}
            >
              <option value="">-- เลือกจังหวัด --</option>
              {THAI_PROVINCES.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          {markets.length > 0 && (
            <div>
              <label className="block mb-2 text-sm font-bold text-gray-700">
                นำไปขายที่ตลาดนัด (แก้ไข)
              </label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2.5 bg-white focus:ring-green-500 focus:border-green-500"
                value={cow.marketId}
                onChange={(e) => setCow({ ...cow, marketId: e.target.value })}
              >
                <option value="">-- ไม่ระบุ / ขายหน้าคอก --</option>
                {markets.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (จ.{m.location || "ไม่ระบุ"})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm font-bold text-gray-700">ลักษณะ / รายละเอียด</label>
            <textarea
              rows="4"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 focus:ring-green-500 focus:border-green-500"
              value={cow.description}
              onChange={(e) => setCow({ ...cow, description: e.target.value })}
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <label className="block mb-2 text-sm font-bold text-gray-700">
              เพิ่ม/เปลี่ยนรูปภาพ
            </label>
            <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
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

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2.5 rounded-xl bg-gray-200 text-gray-700 font-bold text-sm hover:bg-gray-300 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-bold text-sm hover:bg-green-700 transition-colors shadow-lg shadow-green-200"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}