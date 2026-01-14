// frontend/src/pages/Login.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  // เปลี่ยนชื่อจาก email เป็น loginInput เพื่อให้ชัดเจนว่ารับได้ทั้ง email/phone
  const [loginInput, setLoginInput] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // ตรวจสอบเบื้องต้นว่าเป็น email หรือ phone (มี @ หรือไม่)
      const isEmail = loginInput.includes("@");
      const payload = {
        password,
        ...(isEmail
          ? { email: loginInput } // ถ้ามี @ ให้ส่งเป็น email
          : { phoneNumber: loginInput }), // ถ้าไม่มี @ ให้ส่งเป็น phoneNumber (ชื่อ key ต้องตรงกับ backend)
      };

      // ส่งข้อมูลไป backend
      const res = await API.post("/auth/login", payload);
      
      // เก็บ token และข้อมูล user
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      alert("เข้าสู่ระบบสำเร็จ");
      navigate("/"); // ไปหน้า Home
      window.location.reload(); // รีโหลดหน้าเว็บเพื่อให้ Header อัปเดตสถานะการล็อกอิน
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.error || "เข้าสู่ระบบไม่สำเร็จ");
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-10">
      {/* ชื่อเว็บด้านบน (Nav จริงจะอยู่ด้านบนอยู่แล้ว) */}
      <div className="w-full max-w-md text-left px-4 mb-4 md:hidden">
        <span className="font-semibold text-sm">Cow market</span>
      </div>

      <div className="w-full max-w-md px-6">
        {/* หัวข้อ */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-1">Login</h1>
          <p className="text-xs text-gray-500">
            Sign in to continue
          </p>
        </div>

        {/* กล่องฟอร์ม */}
        <form
          onSubmit={handleLogin}
          className="bg-[#f5f5f5] rounded-xl px-6 py-6 shadow-sm"
        >
          {/* Login Input (Email or Phone) */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">Email or Phone</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                👤
              </span>
              <input
                type="text" // ใช้ text เพื่อรับได้ทั้ง email และ phone
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Email or Phone number"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-5">
            <label className="block text-xs text-gray-600 mb-1">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔒
              </span>
              <input
                type="password"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* ลิงก์ไปหน้า Register */}
          <div className="mb-3 text-[11px] text-gray-600">
            Don't have an account?{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              สมัครสมาชิก
            </Link>
          </div>

          {/* ปุ่ม LOGIN */}
          <button
            type="submit"
            className="w-full bg-black text-white text-xs font-semibold py-2 rounded-full hover:bg-gray-900"
          >
            LOGIN
          </button>

          {/* ✅ ลบส่วน Or with และปุ่ม Social ออกแล้ว */}
          
        </form>
      </div>
    </div>
  );
}