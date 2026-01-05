import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

export default function EditCow() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    gender: "",
    age: "",
    weight: "",
    breed: "",
    price: "",
    location: "",
    description: "",
  });

  const [currentImages, setCurrentImages] = useState([]); // รูปเดิมจาก backend
  const [newImages, setNewImages] = useState([]);         // รูปใหม่ที่ผู้ใช้อัปโหลด
  const [loading, setLoading] = useState(true);

  // โหลดข้อมูลวัวเดิมมาใส่ฟอร์ม
  useEffect(() => {
    const fetchCow = async () => {
      try {
        const res = await API.get(`/cows/${id}`);
        const c = res.data;
        setForm({
          name: c.name || "",
          gender: c.gender || "",
          age: c.age || "",
          weight: c.weight || "",
          breed: c.breed || "",
          price: c.price || "",
          location: c.location || c.province || "",
          description: c.description || "",
        });
        setCurrentImages(c.images || []);
      } catch (err) {
        console.error("LOAD COW ERROR:", err.response || err);
        alert("ไม่สามารถโหลดข้อมูลวัวได้");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchCow();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImagesChange = (e) => {
    setNewImages(Array.from(e.target.files || []));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const fd = new FormData();

      // เติมข้อมูลฟอร์มลงใน FormData
      fd.append("name", form.name);
      fd.append("gender", form.gender);
      fd.append("age", form.age ? Number(form.age) : "");
      fd.append("weight", form.weight);
      fd.append("breed", form.breed);
      fd.append("price", form.price);
      fd.append("location", form.location);
      fd.append("description", form.description);

      // ถ้ามีอัปโหลดรูปใหม่ ให้ส่งไฟล์ไปด้วย
      if (newImages.length > 0) {
        newImages.forEach((file) => {
          fd.append("images", file);
        });
      }

      await API.put(`/cows/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("แก้ไขข้อมูลเรียบร้อย");
      navigate(`/cows/${id}`);
    } catch (err) {
      console.error("UPDATE COW ERROR:", err.response || err);
      alert(err.response?.data?.error || "แก้ไขไม่สำเร็จ");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        กำลังโหลด...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-1 text-center">แก้ไขข้อมูลวัว</h1>
        <p className="text-xs text-gray-500 mb-6 text-center">
          ปรับปรุงข้อมูลวัวของคุณ
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block mb-1">ชื่อวัว</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1">เพศ</label>
              <input
                name="gender"
                value={form.gender}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block mb-1">พันธุ์</label>
              <input
                name="breed"
                value={form.breed}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block mb-1">อายุ (ปี)</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block mb-1">น้ำหนัก (กก.)</label>
              <input
                type="text"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block mb-1">ราคา (บาท)</label>
              <input
                type="text"
                name="price"
                value={form.price}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">จังหวัด / สถานที่</label>
            <input
              name="location"
              value={form.location}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block mb-1">ลักษณะ / รายละเอียด</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 text-sm min-h-[80px]"
            />
          </div>

          {/* รูปภาพ */}
          <div className="space-y-2">
            <label className="block mb-1">รูปวัว</label>

            {/* แสดงรูปเดิม (ถ้ามี) */}
            {currentImages && currentImages.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-2">
                {currentImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="w-24 h-24 bg-gray-200 rounded overflow-hidden"
                  >
                    <img
                      src={`http://localhost:5000${img}`}
                      alt={`cow-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImagesChange}
              className="text-xs"
            />
            <p className="text-[11px] text-gray-500">
              ถ้าเลือกไฟล์ใหม่ ระบบจะใช้รูปใหม่แทนรูปเดิม (การจัดการลบ/แทนที่ให้ไปทำฝั่ง backend)
            </p>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 rounded-full bg-gray-300 text-xs font-semibold hover:bg-gray-400"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full bg-green-500 text-white text-xs font-semibold hover:bg-green-600"
            >
              บันทึกการแก้ไข
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
