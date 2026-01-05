import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      alert("เข้าสู่ระบบสำเร็จ");
      navigate("/");
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
            Use your email to login
          </p>
        </div>

        {/* กล่องฟอร์ม */}
        <form
          onSubmit={handleLogin}
          className="bg-[#f5f5f5] rounded-xl px-6 py-6 shadow-sm"
        >
          {/* Email */}
          <div className="mb-3">
            <label className="block text-xs text-gray-600 mb-1">Email</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                ✉️
              </span>
              <input
                type="email"
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded-sm bg-white focus:outline-none focus:ring-1 focus:ring-gray-400"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            Create Account:{" "}
            <Link to="/register" className="text-blue-500 hover:underline">
              สมัครสมาชิก
            </Link>
          </div>

          {/* ปุ่ม LOGIN */}
          <button
            type="submit"
            className="w-full bg-black text-white text-xs font-semibold py-2 rounded-full mb-4 hover:bg-gray-900"
          >
            LOGIN
          </button>

          {/* เส้น Or with */}
          <div className="flex items-center mb-3">
            <span className="flex-1 h-px bg-gray-300" />
            <span className="px-2 text-[10px] text-gray-500">Or with</span>
            <span className="flex-1 h-px bg-gray-300" />
          </div>

          {/* ปุ่ม Social (Mock) */}
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-white text-[11px] text-gray-600 border border-gray-300 rounded-full py-1.5"
            >
              {/* ไอคอน Facebook แบบง่ายๆ */}
              <span className="w-4 h-4 bg-blue-600 text-white text-[10px] flex items-center justify-center rounded">
                f
              </span>
              Sign in with Facebook
            </button>

            <button
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-white text-[11px] text-gray-600 border border-gray-300 rounded-full py-1.5"
            >
              {/* ไอคอน Google แบบง่ายๆ */}
              <span className="w-4 h-4 bg-red-500 text-white text-[10px] flex items-center justify-center rounded">
                G
              </span>
              Sign in with Google
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
