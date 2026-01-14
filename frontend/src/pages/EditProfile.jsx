import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

export default function EditProfile() {
  const [form, setForm] = useState({
    name: "",
    phoneNumber: "", 
    address: "",
    facebook: "", // ✅ เพิ่ม state
    line: "",     // ✅ เพิ่ม state
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/users/me");
        const u = res.data.user || res.data;

        setForm({
          name: u.name || "",
          phoneNumber: u.phoneNumber || u.phone || "", 
          address: u.address || "",
          facebook: u.facebook || "", // ✅ ดึงข้อมูลเก่ามาใส่
          line: u.line || "",         // ✅ ดึงข้อมูลเก่ามาใส่
        });
      } catch (err) {
        console.error("LOAD PROFILE ERROR:", err.response || err);
      }
    };
    load();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const fd = new FormData();
    fd.append("name", form.name);
    fd.append("phoneNumber", form.phoneNumber); 
    fd.append("address", form.address);
    fd.append("facebook", form.facebook); // ✅ ส่งไป backend
    fd.append("line", form.line);         // ✅ ส่งไป backend

    if (avatarFile) {
      fd.append("avatar", avatarFile);
    }

    try {
      const res = await API.put("/users/me", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const updatedUser = res.data.user || res.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      alert("บันทึกโปรไฟล์เรียบร้อย");
      navigate(`/profile/${updatedUser.id}`);
    } catch (err) {
      console.error("UPDATE PROFILE ERROR:", err.response || err);
      alert(err.response?.data?.error || "อัปเดตโปรไฟล์ไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center py-10">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-bold mb-1 text-center">แก้ไขโปรไฟล์</h1>
        <p className="text-xs text-gray-500 mb-6 text-center">
          อัปเดตชื่อ เบอร์โทร ที่อยู่ และรูปโปรไฟล์ของคุณ
        </p>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block mb-1">ชื่อ</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block mb-1">โทรศัพท์</label>
            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          {/* ✅✅ เพิ่มช่องกรอก Facebook & Line */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1 text-blue-700 font-semibold">Facebook</label>
              <input
                name="facebook"
                value={form.facebook}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="ชื่อเฟสบุ๊ค"
              />
            </div>
            <div>
              <label className="block mb-1 text-green-600 font-semibold">Line ID</label>
              <input
                name="line"
                value={form.line}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
                placeholder="ไอดีไลน์"
              />
            </div>
          </div>

          <div>
            <label className="block mb-1">ที่อยู่</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2 min-h-[80px]"
            />
          </div>

          <div>
            <label className="block mb-1">รูปโปรไฟล์</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setAvatarFile(e.target.files[0] || null)}
              className="w-full text-sm"
            />
            <p className="text-xs text-gray-400 mt-1">
              รองรับไฟล์รูปภาพ เช่น .jpg, .png
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
              บันทึก
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}