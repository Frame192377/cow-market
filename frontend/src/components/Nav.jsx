import { Link, useNavigate } from "react-router-dom";

export default function Nav() {
  const navigate = useNavigate();

  // อ่าน user จาก localStorage ทุกครั้งที่ Nav render
  const saved = localStorage.getItem("user");
  const user = saved ? JSON.parse(saved) : null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <header className="w-full bg-white shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-3">

        {/* Left: Logo + Menu */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-bold">
            Cow market
          </Link>

          <nav className="flex gap-6 font-semibold text-sm">
            <Link to="/">หน้าแรก</Link>
            <Link to="/cows">สินค้า</Link>
            <Link to="/markets">ตลาดนัด</Link>
            <Link to="/sold-out">ขายแล้ว</Link>
          </nav>
        </div>

        {/* Right: Search + Login/Profile */}
        <div className="flex items-center gap-4">
          {/* Search Box */}
          <input
            type="text"
            className="border rounded-full px-4 py-1 text-sm w-40 focus:outline-none"
            placeholder="ค้นหาวัว..."
          />

          {/* ยังไม่ล็อกอิน → แสดง 'เข้าสู่ระบบ' */}
          {!user && (
            <Link
              to="/login"
              className="font-semibold text-black hover:underline"
            >
              เข้าสู่ระบบ
            </Link>
          )}

          {/* ล็อกอินแล้ว → แสดงไอคอนโปรไฟล์ + ปุ่มออกจากระบบ */}
          {user && (
            <div className="flex items-center gap-3">
              <Link to="/profile">
                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-blue-400">
                  {user.avatar ? (
                    <img
                      src={`http://localhost:5000${user.avatar}`}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-black font-bold">
                      {user.name?.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>

              <button
                onClick={handleLogout}
                className="text-sm text-red-500 hover:underline"
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
