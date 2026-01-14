// src/components/Nav.jsx
import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";

// แนะนำให้ดึง URL จาก Environment Variable (ถ้าไม่มีให้ใช้ localhost)
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function Nav() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [keyword, setKeyword] = useState("");

  // โหลด User เมื่อ Component ถูก Mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("user");
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
      localStorage.removeItem("user"); // เคลียร์ข้อมูลที่เสียออก
    }
  }, []); // *หมายเหตุ: ถ้าใช้ AuthContext จะจัดการ state ได้ดีกว่านี้

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null); // อัปเดต State เพื่อให้ UI เปลี่ยนทันที
    navigate("/login");
  };

  const handleSearch = (e) => {
    if (e.key === "Enter" && keyword.trim() !== "") {
      navigate(`/search?q=${encodeURIComponent(keyword)}`);
    }
  };

  // Class สำหรับเมนู (Active vs Inactive)
  const navLinkClass = ({ isActive }) =>
    isActive ? "text-blue-600 font-bold" : "text-gray-600 hover:text-blue-500";

  // Check if user is admin
  const isAdmin = user?.role === 'admin';

  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">
        {/* Left: Logo + Menu */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold text-gray-800">
            Cow Market
          </Link>

          <nav className="hidden md:flex gap-6 font-semibold text-sm">
            <NavLink to="/" className={navLinkClass}>หน้าแรก</NavLink>
            <NavLink to="/cows" className={navLinkClass}>สินค้า</NavLink>
            <NavLink to="/markets" className={navLinkClass}>ตลาดนัด</NavLink>
            <NavLink to="/sold-out" className={navLinkClass}>ขายแล้ว</NavLink>
            {isAdmin && (
              <NavLink to="/admin" className={navLinkClass}>
                แดชบอร์ด
              </NavLink>
            )}
          </nav>
        </div>

        {/* Right: Search + Login/Profile */}
        <div className="flex items-center gap-4">
          {/* Search Box */}
          <div className="relative hidden sm:block">
            <input
              type="text"
              className="border border-gray-300 rounded-full px-4 py-1.5 text-sm w-48 focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="ค้นหาวัว..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={handleSearch}
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 absolute right-3 top-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* User Section */}
          {!user ? (
            <Link
              to="/login"
              className="font-semibold text-gray-700 hover:text-blue-600 transition"
            >
              เข้าสู่ระบบ
            </Link>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/profile" title="ดูโปรไฟล์">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border border-gray-300 hover:ring-2 hover:ring-blue-400 transition">
                  {user.avatar ? (
                    <img
                      src={`${API_URL}${user.avatar}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = 'none'; }} // ซ่อนรูปถ้าโหลดไม่ขึ้น
                    />
                  ) : (
                    <span className="text-gray-700 font-bold text-sm">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm font-medium text-red-500 hover:text-red-700 transition"
              >
                ออกจากระบบ
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}