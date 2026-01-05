// frontend/src/pages/AddListing.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

// --- ข้อมูลคงที่ (Static Data) ---

// 1. รายชื่อสายพันธุ์วัวในไทย
const COW_BREEDS = [
  "บราห์มัน (Brahman)",
  "ลูกผสมบราห์มัน",
  "ชาร์โรเลส์ (Charolais)",
  "ลูกผสมชาร์โรเลส์",
  "ฮินดูบราซิล (Hindu Brazil)",
  "บีฟมาสเตอร์ (Beefmaster)",
  "แองกัส (Angus)",
  "วากิว (Wagyu)",
  "กำแพงแสน",
  "ตาก",
  "กบินทร์บุรี",
  "ไทยพื้นเมือง (Native)",
  "โฮลสไตน์ (วัวนม)",
  "อื่นๆ"
];

// 2. รายชื่อ 77 จังหวัด (เรียงตัวอักษร)
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

export default function AddListing() {
  const navigate = useNavigate();

  const [type, setType] = useState("cow"); 
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Data State: วัว
  const [cow, setCow] = useState({
    name: "",
    gender: "",
    breed: "",
    age: "",
    weight: "",
    price: "",
    location: "",
    description: "",
  });

  // Data State: สินค้า
  const [product, setProduct] = useState({
    name: "",
    category: "medicine",
    price: "",
    description: "",
  });

  // Data State: ตลาดนัด
  const [market, setMarket] = useState({
    name: "",
    location: "",
    date: "",
    contact: "",
    description: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    let url = "";

    if (type === "cow") {
      url = "/";
      Object.entries(cow).forEach(([k, v]) => formData.append(k, v));
    } else if (type === "product") {
      url = "/products";
      Object.entries(product).forEach(([k, v]) => formData.append(k, v));
    } else if (type === "market") {
      url = "/markets";
      Object.entries(market).forEach(([k, v]) => formData.append(k, v));
    }

    images.forEach((img) => formData.append("images", img));

    try {
      await API.post(url, formData);
      alert("บันทึกรายการสำเร็จ!");
      // ✅ แก้ไขตรงนี้: เปลี่ยนจาก /marketplace เป็น /cows
      navigate(type === "market" ? "/markets" : "/cows");
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการบันทึก");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex justify-center py-10 px-4 font-sans">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-center mb-2 text-black">
          เพิ่มรายการขาย
        </h1>
        <p className="text-gray-500 text-center mb-6 text-sm">
          เลือกประเภทแล้วกรอกข้อมูลที่ต้องการลงประกาศ
        </p>

        {/* ปุ่มเลือกประเภท */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            type="button"
            onClick={() => setType("cow")}
            className={`px-6 py-2 rounded-full border border-gray-200 text-sm font-medium transition-colors ${
              type === "cow"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            วัว
          </button>
          
          <button
            type="button"
            onClick={() => setType("product")}
            className={`px-6 py-2 rounded-full border border-gray-200 text-sm font-medium transition-colors ${
              type === "product"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            สินค้าอื่น ๆ
          </button>

          <button
            type="button"
            onClick={() => setType("market")}
            className={`px-6 py-2 rounded-full border border-gray-200 text-sm font-medium transition-colors ${
              type === "market"
                ? "bg-black text-white border-black"
                : "bg-white text-gray-700 hover:bg-gray-50"
            }`}
          >
            ตลาดนัด
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* ---------------- ฟอร์มวัว ---------------- */}
          {type === "cow" && (
            <>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800">ชื่อวัว</label>
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5"
                  value={cow.name}
                  onChange={(e) => setCow({ ...cow, name: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800">เพศ</label>
                  <select
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white"
                    value={cow.gender}
                    onChange={(e) => setCow({ ...cow, gender: e.target.value })}
                  >
                    <option value="">-- เลือกเพศ --</option>
                    <option value="ผู้">ผู้</option>
                    <option value="เมีย">เมีย</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800">พันธุ์</label>
                  <select
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white"
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

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800">อายุ (ปี)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5"
                    value={cow.age}
                    onChange={(e) => setCow({ ...cow, age: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800">น้ำหนัก (กก.)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5"
                    value={cow.weight}
                    onChange={(e) => setCow({ ...cow, weight: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800">ราคา (บาท)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5"
                    value={cow.price}
                    onChange={(e) => setCow({ ...cow, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800">จังหวัด / สถานที่</label>
                <select
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white"
                  value={cow.location}
                  onChange={(e) => setCow({ ...cow, location: e.target.value })}
                >
                  <option value="">-- เลือกจังหวัด --</option>
                  {THAI_PROVINCES.map((province) => (
                    <option key={province} value={province}>{province}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800">ลักษณะ / รายละเอียด</label>
                <textarea
                  rows="4"
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5"
                  value={cow.description}
                  onChange={(e) => setCow({ ...cow, description: e.target.value })}
                ></textarea>
              </div>
            </>
          )}

          {/* ---------------- ฟอร์มสินค้า ---------------- */}
          {type === "product" && (
            <>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800">ชื่อสินค้า</label>
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5"
                  value={product.name}
                  onChange={(e) => setProduct({ ...product, name: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800">หมวดหมู่</label>
                  <select
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5 bg-white"
                    value={product.category}
                    onChange={(e) => setProduct({ ...product, category: e.target.value })}
                  >
                    <option value="medicine">ยา</option>
                    <option value="supplement">อาหารเสริม</option>
                    <option value="equipment">อุปกรณ์</option>
                    <option value="other">อื่นๆ</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-sm font-semibold text-gray-800">ราคา (บาท)</label>
                  <input
                    type="number"
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5"
                    value={product.price}
                    onChange={(e) => setProduct({ ...product, price: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800">รายละเอียดสินค้า</label>
                <textarea
                  rows="4"
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5"
                  value={product.description}
                  onChange={(e) => setProduct({ ...product, description: e.target.value })}
                ></textarea>
              </div>
            </>
          )}

          {/* ---------------- ฟอร์มตลาดนัด ---------------- */}
          {type === "market" && (
            <>
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800">ชื่อตลาดนัด</label>
                <input
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5"
                  placeholder="เช่น ตลาดนัดโคกระบือบ้านหัน"
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block mb-2 text-sm font-semibold text-gray-800">วัน/เวลา เปิดทำการ</label>
                   <input
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5"
                    placeholder="เช่น ทุกวันเสาร์ 05:00 - 12:00 น."
                    value={market.date}
                    onChange={(e) => setMarket({ ...market, date: e.target.value })}
                   />
                </div>
                <div>
                   <label className="block mb-2 text-sm font-semibold text-gray-800">เบอร์โทรติดต่อ</label>
                   <input
                    className="w-full border border-gray-200 rounded-md px-3 py-2.5"
                    placeholder="08x-xxx-xxxx"
                    value={market.contact}
                    onChange={(e) => setMarket({ ...market, contact: e.target.value })}
                   />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-800">รายละเอียด / กฎระเบียบ</label>
                <textarea
                  rows="4"
                  className="w-full border border-gray-200 rounded-md px-3 py-2.5"
                  placeholder="รายละเอียดเพิ่มเติมเกี่ยวกับตลาด..."
                  value={market.description}
                  onChange={(e) => setMarket({ ...market, description: e.target.value })}
                ></textarea>
              </div>
            </>
          )}

          {/* ส่วนอัปโหลดรูปภาพ (ใช้ร่วมกันทุกฟอร์ม) */}
          <div className="pt-2">
            <label className="block mb-2 text-sm font-semibold text-gray-800">
              รูปภาพประกอบ
            </label>
            <input
              type="file"
              multiple
              onChange={(e) => setImages(Array.from(e.target.files))}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border file:border-gray-300
                file:text-sm file:font-semibold
                file:bg-white file:text-gray-700
                hover:file:bg-gray-50 cursor-pointer"
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
              className="px-6 py-2 rounded-full bg-green-500 text-white font-semibold text-sm hover:bg-green-600 transition-colors shadow-sm"
            >
              {loading ? "กำลังบันทึก..." : "บันทึกรายการ"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}