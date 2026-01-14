// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const API_URL = "http://localhost:5000";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("stats");
  const [stats, setStats] = useState({ users: 0, cows: 0, products: 0, orders: 0 });
  
  // State สำหรับเก็บข้อมูลในตาราง
  const [items, setItems] = useState([]); 
  
  // State เพิ่มเติมสำหรับหน้า Dashboard (Stats)
  const [pendingItems, setPendingItems] = useState([]); // รายการรออนุมัติ
  const [recentOrders, setRecentOrders] = useState([]); // ออเดอร์ล่าสุด

  const [loading, setLoading] = useState(false);

  // โหลดข้อมูลตาม Tab ที่เลือก
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeTab === "stats") {
          // ✅ โหลดข้อมูลพร้อมกันหลายอย่างเพื่อมาโชว์หน้า Dashboard
          const [statsRes, cowsRes, productsRes, ordersRes] = await Promise.all([
            API.get("/admin/stats"),
            API.get("/admin/cows"),
            API.get("/admin/products"),
            API.get("/admin/orders")
          ]);

          setStats(statsRes.data);

          // กรองหา "วัว" และ "สินค้า" ที่รออนุมัติ (status === 'pending')
          const pCows = cowsRes.data.filter(c => c.status === 'pending').map(i => ({ ...i, type: 'cow' }));
          const pProds = productsRes.data.filter(p => p.status === 'pending').map(i => ({ ...i, type: 'product' }));
          setPendingItems([...pCows, ...pProds]); // รวมกันไว้

          // ตัดเอา 5 ออเดอร์ล่าสุด
          setRecentOrders(ordersRes.data.slice(0, 5));

        } else if (activeTab === "users") {
          const res = await API.get("/admin/users");
          setItems(res.data);
        } else if (activeTab === "cows") {
          const res = await API.get("/admin/cows");
          setItems(res.data);
        } else if (activeTab === "products") {
          const res = await API.get("/admin/products");
          setItems(res.data);
        } else if (activeTab === "orders") {
          const res = await API.get("/admin/orders");
          setItems(res.data);
        }
      } catch (err) {
        console.error("Admin Access Error", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [activeTab, navigate]);

  // ฟังก์ชันเปลี่ยนสถานะ (อนุมัติ / ปฏิเสธ)
  const handleStatusUpdate = async (id, typeParam, newStatus) => {
    if (!window.confirm(`ยืนยันการเปลี่ยนสถานะเป็น "${newStatus}" ?`)) return;
    try {
      await API.put(`/admin/${typeParam}/${id}/status`, { status: newStatus });
      
      // อัปเดตในตารางหลัก
      setItems(items.map(item => item.id === id ? { ...item, status: newStatus } : item));
      
      // อัปเดตในรายการ Pending (ถ้าอยู่ในหน้า Stats)
      setPendingItems(pendingItems.filter(item => item.id !== id));

    } catch (err) {
      alert("อัปเดตไม่สำเร็จ");
    }
  };

  const handleDelete = async (id, typeParam) => {
    if (!window.confirm("คุณแน่ใจหรือไม่ที่จะลบรายการนี้?")) return;
    try {
      await API.delete(`/admin/${typeParam}/${id}`);
      setItems(items.filter((item) => item.id !== id));
    } catch (err) {
      alert("ลบไม่สำเร็จ");
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
        case 'approved': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm">✓ อนุมัติแล้ว</span>;
        case 'pending': return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1 w-fit mx-auto"><span className="animate-pulse">●</span> รออนุมัติ</span>;
        case 'rejected': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold shadow-sm">✕ ปฏิเสธ</span>;
        case 'sold': return <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs font-bold shadow-sm">ขายแล้ว</span>;
        default: return <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded text-xs">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 text-white p-6 hidden md:block fixed h-full shadow-xl">
        <h1 className="text-2xl font-bold mb-10 text-green-400 tracking-wider">Admin Panel</h1>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab("stats")} className={`w-full text-left py-3 px-4 rounded-lg transition ${activeTab === "stats" ? "bg-green-600 font-bold shadow-lg" : "hover:bg-gray-800 text-gray-300"}`}>📊 ภาพรวมระบบ</button>
          <button onClick={() => setActiveTab("users")} className={`w-full text-left py-3 px-4 rounded-lg transition ${activeTab === "users" ? "bg-blue-600 font-bold shadow-lg" : "hover:bg-gray-800 text-gray-300"}`}>👥 จัดการสมาชิก</button>
          <button onClick={() => setActiveTab("cows")} className={`w-full text-left py-3 px-4 rounded-lg transition ${activeTab === "cows" ? "bg-green-600 font-bold shadow-lg" : "hover:bg-gray-800 text-gray-300"}`}>🐮 จัดการอนุมัติวัว</button>
          <button onClick={() => setActiveTab("products")} className={`w-full text-left py-3 px-4 rounded-lg transition ${activeTab === "products" ? "bg-purple-600 font-bold shadow-lg" : "hover:bg-gray-800 text-gray-300"}`}>📦 จัดการอนุมัติสินค้า</button>
          <button onClick={() => setActiveTab("orders")} className={`w-full text-left py-3 px-4 rounded-lg transition ${activeTab === "orders" ? "bg-orange-600 font-bold shadow-lg" : "hover:bg-gray-800 text-gray-300"}`}>📑 รายการคำสั่งซื้อ</button>
          <hr className="border-gray-700 my-4"/>
          <button onClick={() => navigate("/")} className="w-full text-left py-2 px-4 text-gray-400 hover:text-white transition flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
            กลับหน้าบ้าน
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 md:ml-64 overflow-y-auto">
        
        <h2 className="text-3xl font-bold text-gray-800 mb-6">
            {activeTab === "stats" && "Dashboard Overview"}
            {activeTab === "users" && "รายชื่อสมาชิกทั้งหมด"}
            {activeTab === "cows" && "รายการวัวทั้งหมด"}
            {activeTab === "products" && "สินค้าอื่นๆ ทั้งหมด"}
            {activeTab === "orders" && "ประวัติคำสั่งซื้อทั้งหมด"}
        </h2>

        {loading ? (
            <div className="text-center py-20 text-gray-500">กำลังโหลดข้อมูล...</div>
        ) : (
            <>
                {/* === 1. Stats View === */}
                {activeTab === "stats" && (
                    <div className="space-y-8">
                        {/* การ์ดสถิติ */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div onClick={() => setActiveTab("users")} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-blue-500 cursor-pointer hover:shadow-md transition">
                                <p className="text-gray-500 text-sm font-bold uppercase">สมาชิกทั้งหมด</p>
                                <p className="text-4xl font-bold text-blue-600 mt-2">{stats.users}</p>
                            </div>
                            <div onClick={() => setActiveTab("cows")} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500 cursor-pointer hover:shadow-md transition">
                                <p className="text-gray-500 text-sm font-bold uppercase">วัวในระบบ</p>
                                <p className="text-4xl font-bold text-green-600 mt-2">{stats.cows}</p>
                            </div>
                            <div onClick={() => setActiveTab("products")} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500 cursor-pointer hover:shadow-md transition">
                                <p className="text-gray-500 text-sm font-bold uppercase">สินค้าอื่นๆ</p>
                                <p className="text-4xl font-bold text-purple-600 mt-2">{stats.products}</p>
                            </div>
                            <div onClick={() => setActiveTab("orders")} className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-orange-500 cursor-pointer hover:shadow-md transition">
                                <p className="text-gray-500 text-sm font-bold uppercase">คำสั่งซื้อทั้งหมด</p>
                                <p className="text-4xl font-bold text-orange-600 mt-2">{stats.orders}</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* ✅ ส่วนที่เพิ่ม: รายการรออนุมัติ */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-yellow-50 px-6 py-4 border-b border-yellow-100 flex justify-between items-center">
                                    <h3 className="font-bold text-yellow-800 flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
                                        รายการรอตรวจสอบ ({pendingItems.length})
                                    </h3>
                                    {pendingItems.length > 0 && <span className="text-xs text-yellow-600 font-medium">รอการอนุมัติจากคุณ</span>}
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {pendingItems.length === 0 ? (
                                        <p className="text-center py-10 text-gray-400 text-sm">ไม่มีรายการรอตรวจสอบ</p>
                                    ) : (
                                        pendingItems.slice(0, 5).map(item => (
                                            <div key={`${item.type}-${item.id}`} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <img src={item.images?.[0] ? `${API_URL}${item.images[0]}` : ""} className="w-10 h-10 rounded-lg object-cover bg-gray-100" />
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-800">{item.name}</p>
                                                        <p className="text-xs text-gray-500">{item.type === 'cow' ? 'วัว' : 'สินค้า'} • โดย {item.User?.name}</p>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2">
                                                    <button onClick={() => handleStatusUpdate(item.id, item.type, "approved")} className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 shadow">อนุมัติ</button>
                                                    <button onClick={() => handleStatusUpdate(item.id, item.type, "rejected")} className="px-3 py-1 bg-gray-200 text-gray-600 text-xs rounded hover:bg-gray-300">ปัดตก</button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                    {pendingItems.length > 5 && <div className="p-2 text-center bg-gray-50 text-xs text-gray-500 cursor-pointer hover:bg-gray-100" onClick={() => setActiveTab("cows")}>ดูทั้งหมด...</div>}
                                </div>
                            </div>

                            {/* ✅ ส่วนที่เพิ่ม: คำสั่งซื้อล่าสุด */}
                            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                <div className="bg-blue-50 px-6 py-4 border-b border-blue-100">
                                    <h3 className="font-bold text-blue-800">คำสั่งซื้อล่าสุด</h3>
                                </div>
                                <div className="divide-y divide-gray-100">
                                    {recentOrders.length === 0 ? (
                                        <p className="text-center py-10 text-gray-400 text-sm">ยังไม่มีคำสั่งซื้อ</p>
                                    ) : (
                                        recentOrders.map(order => (
                                            <div key={order.id} className="p-4 flex items-center justify-between hover:bg-gray-50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">#{order.id}</div>
                                                    <div>
                                                        <p className="font-bold text-sm text-gray-800">{order.Product?.name}</p>
                                                        <p className="text-xs text-gray-500">ผู้ซื้อ: {order.Buyer?.name} • {new Date(order.createdAt).toLocaleDateString("th-TH")}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-xs px-2 py-1 rounded font-bold ${order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{order.status}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* === 2. Table Views (สำหรับ Tab อื่นๆ) === */}
                {activeTab !== "stats" && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-100 text-gray-700 uppercase font-bold text-xs">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    
                                    {/* Column Headers */}
                                    {activeTab === "users" && <><th className="px-6 py-4">ชื่อสมาชิก</th><th className="px-6 py-4">อีเมล/เบอร์</th><th className="px-6 py-4">Role</th></>}
                                    
                                    {(activeTab === "cows" || activeTab === "products") && <><th className="px-6 py-4">รูปภาพ</th><th className="px-6 py-4">ชื่อรายการ</th><th className="px-6 py-4">ราคา</th><th className="px-6 py-4">ผู้ลงขาย</th><th className="px-6 py-4">สถานะ</th></>}
                                    
                                    {activeTab === "orders" && <><th className="px-6 py-4">สินค้า</th><th className="px-6 py-4">ผู้ซื้อ</th><th className="px-6 py-4">ผู้ขาย</th><th className="px-6 py-4">ยอดรวม</th><th className="px-6 py-4">สถานะ</th></>}
                                    
                                    {activeTab !== "orders" && <th className="px-6 py-4 text-center">จัดการ</th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {items.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4 font-mono text-xs">#{item.id}</td>

                                        {/* --- Users Table --- */}
                                        {activeTab === "users" && (
                                            <>
                                                <td className="px-6 py-4 font-bold text-gray-800 flex items-center gap-3">
                                                    <img src={item.avatar ? `${API_URL}${item.avatar}` : "https://cdn-icons-png.flaticon.com/512/847/847969.png"} className="w-8 h-8 rounded-full bg-gray-200 object-cover" alt="avatar"/>
                                                    {item.name}
                                                </td>
                                                <td className="px-6 py-4">{item.email}<br/><span className="text-xs text-gray-400">{item.phoneNumber}</span></td>
                                                <td className="px-6 py-4"><span className={`px-2 py-1 rounded text-xs font-bold ${item.role === 'admin' ? 'bg-black text-white' : 'bg-gray-200 text-gray-700'}`}>{item.role}</span></td>
                                                <td className="px-6 py-4 text-center">
                                                    {item.role !== 'admin' && <button className="text-red-500 hover:text-red-700 text-xs font-bold">แบน/ลบ</button>}
                                                </td>
                                            </>
                                        )}

                                        {/* --- Cows & Products Table --- */}
                                        {(activeTab === "cows" || activeTab === "products") && (
                                            <>
                                                <td className="px-6 py-4">
                                                    <img src={item.images?.[0] ? `${API_URL}${item.images[0]}` : "https://via.placeholder.com/100"} className="w-12 h-12 rounded object-cover bg-gray-100 border" alt="thumb" />
                                                </td>
                                                <td className="px-6 py-4 font-bold text-gray-800">{item.name}</td>
                                                <td className="px-6 py-4 text-green-600 font-bold">{Number(item.price).toLocaleString()}</td>
                                                <td className="px-6 py-4 text-xs">{item.User?.name || "Unknown"}</td>
                                                <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        {item.status === 'pending' && (
                                                            <>
                                                                <button onClick={() => handleStatusUpdate(item.id, activeTab === "cows" ? "cow" : "product", "approved")} className="bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition transform hover:scale-105">อนุมัติ</button>
                                                                <button onClick={() => handleStatusUpdate(item.id, activeTab === "cows" ? "cow" : "product", "rejected")} className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition transform hover:scale-105">ปฏิเสธ</button>
                                                            </>
                                                        )}
                                                        <button onClick={() => handleDelete(item.id, activeTab === "cows" ? "cow" : "product")} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-bold transition">ลบ</button>
                                                    </div>
                                                </td>
                                            </>
                                        )}

                                        {/* --- Orders Table --- */}
                                        {activeTab === "orders" && (
                                            <>
                                                <td className="px-6 py-4 font-bold text-gray-800">{item.Product?.name || "Deleted Product"}</td>
                                                <td className="px-6 py-4">{item.Buyer?.name}</td>
                                                <td className="px-6 py-4">{item.Seller?.name}</td>
                                                <td className="px-6 py-4 text-green-600 font-bold">{Number(item.totalPrice).toLocaleString()}</td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2 py-1 rounded text-xs font-bold 
                                                        ${item.status === 'completed' ? 'bg-green-100 text-green-700' : 
                                                          item.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`
                                                    }>
                                                        {item.status}
                                                    </span>
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                        {items.length === 0 && <p className="text-center py-10 text-gray-400">ไม่พบข้อมูล</p>}
                    </div>
                )}
            </>
        )}
      </div>
    </div>
  );
}