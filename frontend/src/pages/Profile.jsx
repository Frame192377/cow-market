import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // ดึงข้อมูล user จาก localStorage
  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      setUser(JSON.parse(stored));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    alert("ออกจากระบบเรียบร้อย");
    navigate("/login");
  };

  const handleEditProfile = () => {
    navigate("/profile/edit");
  };

  const handleAddListing = () => {
    navigate("/add-listing");
  };

  if (!user) return null;

  const displayName = user.name || "ผู้ใช้ Cow market";
  const displayEmail = user.email || "-";
  const displayPhone = user.phone || "-";
  const displayAddress = user.address || "ยังไม่ได้ระบุ";

  return (
    <div className="min-h-screen bg-gray-200">
      {/* Header */}
      <header className="pt-8 pb-4 text-center bg-gray-200 border-b ">
        <h1 className="text-3xl font-extrabold mb-2">โปรไฟล์</h1>
        <div className="flex items-center justify-center gap-4">
          <span className="h-px w-24 bg-black/40" />
          <span className="text-xl font-semibold">Cow market</span>
          <span className="h-px w-24 bg-black/40" />
        </div>
      </header>

      {/* Main card */}
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-white rounded-3xl shadow-lg px-8 py-10 flex flex-col md:flex-row gap-10 items-center">
          {/* ซ้าย : รูปโปรไฟล์ + ชื่อ + ปุ่มแก้ไข */}
          <div className="w-full md:w-1/3 flex flex-col items-center">
            <div className="w-40 h-40 bg-gray-300 rounded-md flex items-center justify-center mb-5 overflow-hidden">
              {user.avatar ? (
                <img
                  src={`http://localhost:5000${user.avatar}`}
                  alt={displayName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-20 h-24 bg-gray-500 rounded-full flex flex-col items-center justify-center text-4xl text-gray-200">
                  <span className="leading-none">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <p className="text-lg font-bold mb-4 text-center">{displayName}</p>

            <button
              onClick={handleEditProfile}
              className="px-8 py-1.5 rounded-full bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
            >
              แก้ไขโปรไฟล์
            </button>
          </div>

          {/* ขวา : ข้อมูลโปรไฟล์ */}
          <div className="w-full md:w-2/3 text-sm md:text-base space-y-3 leading-relaxed">
            <p>
              <span className="font-bold">ที่อยู่ :</span> {displayAddress}
            </p>
            <p>
              <span className="font-bold">อีเมล :</span> {displayEmail}
            </p>
            <p>
              <span className="font-bold">โทร :</span> {displayPhone}
            </p>
          </div>
        </div>

        {/* ปุ่มด้านล่าง */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <button
            onClick={handleAddListing}
            className="px-8 py-2 rounded-full bg-green-500 text-white text-sm font-semibold hover:bg-green-600"
          >
            เพิ่มรายการขาย (วัว / สินค้าที่เกี่ยวกับวัว)
          </button>

          <button
            onClick={handleLogout}
            className="px-8 py-2 rounded-full bg-black text-white text-sm font-semibold hover:bg-gray-900"
          >
            ออกจากระบบ
          </button>
        </div>
      </main>
    </div>
  );
}
