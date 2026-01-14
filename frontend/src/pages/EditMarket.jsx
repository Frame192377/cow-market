import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

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

// รายการเวลา
const TIME_OPTIONS = [];
for (let h = 0; h < 24; h++) {
  const hour = h.toString().padStart(2, "0");
  TIME_OPTIONS.push(`${hour}:00`);
  TIME_OPTIONS.push(`${hour}:30`);
}
TIME_OPTIONS.push("23:59");

export default function EditMarket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [market, setMarket] = useState({
    name: "",
    location: "",
    date: "", // จะเก็บค่า text ที่ส่งไป DB
    contact: "",
    description: "",
  });

  const [marketDays, setMarketDays] = useState([]);
  const [marketTime, setMarketTime] = useState({ open: "05:00", close: "12:00" });
  const [newImages, setNewImages] = useState([]);

  const DAYS = ["จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์", "อาทิตย์"];

  const toggleDay = (day) => {
    setMarketDays((prev) =>
      prev.includes(day)
        ? prev.filter((d) => d !== day)
        : [...prev, day]
    );
  };

  useEffect(() => {
    const fetchMarket = async () => {
      try {
        const res = await API.get(`/markets/${id}`);
        const m = res.data;
        
        setMarket({
          name: m.name || "",
          location: m.location || "",
          date: m.date || "",
          contact: m.contact || "",
          description: m.description || "",
        });
        
        // หมายเหตุ: การแปลงกลับจาก String "ทุกวัน..." มาเป็น state days/time ค่อนข้างซับซ้อน
        // ในที่นี้ถ้าจะแก้เวลา แนะนำให้ติ๊กเลือกใหม่เลยจะง่ายกว่าครับ

      } catch (err) {
        console.error("Error fetching market:", err);
        alert("ไม่พบข้อมูล หรือคุณไม่มีสิทธิ์แก้ไข");
        navigate("/markets");
      } finally {
        setLoading(false);
      }
    };
    fetchMarket();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    
    // Logic รวมวันเวลา
    let dateString = market.date; 
    if (marketDays.length > 0 && marketTime.open && marketTime.close) {
        const daysStr = marketDays.join(", ");
        dateString = `ทุกวัน${daysStr} เวลา ${marketTime.open} - ${marketTime.close} น.`;
    }

    const finalData = { ...market, date: dateString };

    Object.entries(finalData).forEach(([key, value]) => {
        formData.append(key, value);
    });

    newImages.forEach((img) => formData.append("images", img));

    try {
      await API.put(`/markets/${id}`, formData);
      alert("แก้ไขข้อมูลตลาดนัดสำเร็จ!");
      navigate(`/market/${id}`);
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการแก้ไข");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center pt-20">กำลังโหลดข้อมูล...</div>;

  return (
    <div className="min-h-screen bg-white flex justify-center py-10 px-4 font-sans">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-6 text-black">
          แก้ไขข้อมูลตลาดนัด
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800">ชื่อตลาดนัด</label>
            <input
              className="w-full border border-gray-200 rounded-md px-3 py-2.5"
              value={market.name}
              onChange={(e) => setMarket({ ...market, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800">สถานที่ตั้ง</label>
            <select
              className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white"
              value={market.location}
              onChange={(e) => setMarket({ ...market, location: e.target.value })}
            >
              <option value="">-- เลือกจังหวัด --</option>
              {THAI_PROVINCES.map((province) => (
                <option key={province} value={province}>{province}</option>
              ))}
            </select>
          </div>

          {/* ส่วนแก้ไขวันเวลา (เลือกใหม่ทับของเดิม) */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <label className="block mb-3 text-sm font-bold text-gray-800">
                แก้ไขวัน/เวลา เปิดทำการ (เลือกใหม่เพื่อเปลี่ยน)
            </label>
            <p className="text-xs text-gray-500 mb-2">ค่าเดิม: {market.date}</p>
            
            <div className="flex flex-wrap gap-2 mb-4">
                {DAYS.map((day) => (
                <button
                    key={day}
                    type="button"
                    onClick={() => toggleDay(day)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                    marketDays.includes(day)
                        ? "bg-green-500 text-white border-green-500 shadow-sm"
                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-400"
                    }`}
                >
                    {day}
                </button>
                ))}
            </div>

            <div className="flex gap-4 items-center">
                <div className="flex-1">
                    <label className="block mb-1 text-xs font-semibold text-gray-600">เวลาเปิด</label>
                    <select 
                        className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm bg-white"
                        value={marketTime.open}
                        onChange={(e) => setMarketTime({...marketTime, open: e.target.value})}
                    >
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t} น.</option>)}
                    </select>
                </div>
                <span className="text-gray-400 mt-4">-</span>
                <div className="flex-1">
                    <label className="block mb-1 text-xs font-semibold text-gray-600">เวลาปิด</label>
                    <select 
                        className="w-full border border-gray-300 rounded-md px-2 py-2 text-sm bg-white"
                        value={marketTime.close}
                        onChange={(e) => setMarketTime({...marketTime, close: e.target.value})}
                    >
                        {TIME_OPTIONS.map(t => <option key={t} value={t}>{t} น.</option>)}
                    </select>
                </div>
            </div>
            
            {marketDays.length > 0 && (
                <p className="text-xs text-green-600 mt-3 font-medium bg-green-50 p-2 rounded">
                    จะเปลี่ยนเป็น: ทุกวัน{marketDays.join(", ")} เวลา {marketTime.open} - {marketTime.close} น.
                </p>
            )}
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800">เบอร์โทรติดต่อ</label>
            <input
              className="w-full border border-gray-200 rounded-md px-3 py-2.5"
              value={market.contact}
              onChange={(e) => setMarket({ ...market, contact: e.target.value })}
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-800">รายละเอียด / กฎระเบียบ</label>
            <textarea
              rows="4"
              className="w-full border border-gray-200 rounded-md px-3 py-2.5"
              value={market.description}
              onChange={(e) => setMarket({ ...market, description: e.target.value })}
            ></textarea>
          </div>

          <div className="pt-2 border-t border-gray-100 mt-4">
            <label className="block mb-2 text-sm font-semibold text-gray-800">
              เพิ่ม/เปลี่ยนรูปภาพ (เลือกใหม่หากต้องการเปลี่ยน)
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setNewImages(Array.from(e.target.files))}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border file:border-gray-300 file:text-sm file:font-semibold file:bg-white file:text-gray-700 hover:file:bg-gray-50 cursor-pointer"
            />
          </div>

          <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-6 py-2 rounded-full bg-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-300 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 rounded-full bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกการแก้ไข"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}