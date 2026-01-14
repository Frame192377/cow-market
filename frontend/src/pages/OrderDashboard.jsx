// src/pages/OrderDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../services/api";

const API_URL = "http://localhost:5000";

const STATUS_OPTIONS = [
  { value: 'pending', label: '⏳ รอดำเนินการ', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'paid', label: '💰 รับยอดแล้ว/เตรียมส่ง', color: 'bg-blue-100 text-blue-800' },
  { value: 'shipped', label: '🚚 จัดส่งแล้ว', color: 'bg-purple-100 text-purple-800' },
  { value: 'completed', label: '✅ สำเร็จ', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: '❌ ยกเลิก', color: 'bg-red-100 text-red-800' },
];

export default function OrderDashboard() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await API.get("/orders/seller");
      setOrders(res.data);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    if (!window.confirm(`ต้องการเปลี่ยนสถานะเป็น "${newStatus}" ?`)) return;
    try {
        await API.put(`/orders/${orderId}/status`, { status: newStatus });
        alert("อัปเดตสถานะเรียบร้อย!");
        fetchOrders();
    } catch (err) {
        alert("เกิดข้อผิดพลาดในการอัปเดต");
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">กำลังโหลด...</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans">
      
      {/* Modal ดูสลิป */}
      {selectedSlip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm" onClick={() => setSelectedSlip(null)}>
          <div className="relative p-2 max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedSlip(null)} className="absolute -top-12 right-0 text-white text-4xl font-bold hover:text-gray-300">&times;</button>
            <img src={selectedSlip} alt="Slip" className="w-full max-h-[85vh] object-contain rounded-lg shadow-2xl" />
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 hover:text-black font-bold text-lg transition">
                ← กลับไปหน้าโปรไฟล์
            </button>
            <h1 className="text-2xl font-bold text-gray-800">จัดการคำสั่งซื้อทั้งหมด ({orders.length})</h1>
        </div>

        {orders.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-lg">ยังไม่มีคำสั่งซื้อเข้ามา</p>
            </div>
        ) : (
            <div className="space-y-6">
                {orders.map((order) => (
                    <div key={order.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 flex flex-col lg:flex-row gap-6 relative overflow-hidden group hover:shadow-md transition">
                        
                        {/* Status Strip (แถบสีสถานะด้านซ้าย) */}
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${STATUS_OPTIONS.find(s => s.value === order.status)?.color.split(' ')[0].replace('bg-', 'bg-') || 'bg-gray-200'}`}></div>

                        {/* 1. สินค้า */}
                        <div className="flex gap-5 lg:w-1/3 pl-2">
                            <img 
                                src={order.Product?.images?.[0] ? `${API_URL}${order.Product.images[0]}` : "https://via.placeholder.com/150"} 
                                className="w-24 h-24 rounded-xl object-cover bg-gray-100 border border-gray-100" 
                                alt="product"
                            />
                            <div>
                                <h3 className="font-bold text-gray-800 text-lg">{order.Product?.name}</h3>
                                <p className="text-green-600 font-extrabold text-xl">{Number(order.totalPrice).toLocaleString()} ฿</p>
                                <p className="text-sm text-gray-500 mb-2">จำนวน: {order.quantity} ชิ้น</p>
                                
                                {/* Dropdown เลือกสถานะ */}
                                <div className="relative">
                                    <select 
                                        value={order.status} 
                                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                        className={`w-full appearance-none pl-3 pr-8 py-1.5 rounded-lg text-sm font-bold border-none outline-none ring-1 ring-gray-200 cursor-pointer hover:ring-gray-400 transition ${STATUS_OPTIONS.find(s => s.value === order.status)?.color}`}
                                    >
                                        {STATUS_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>
                                                {opt.label}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none text-gray-500">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. ข้อมูลลูกค้า */}
                        <div className="lg:w-1/3 text-sm text-gray-700 space-y-2 border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">ข้อมูลการจัดส่ง</p>
                            <p><span className="font-semibold text-gray-900">คุณ {order.customerName}</span></p>
                            <p className="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor"><path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" /></svg>
                                <a href={`tel:${order.phoneNumber}`} className="text-blue-600 hover:underline">{order.phoneNumber}</a>
                            </p>
                            <p className="flex items-start gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                                <span>{order.address}</span>
                            </p>
                        </div>

                        {/* 3. การชำระเงิน & สลิป */}
                        <div className="lg:w-1/3 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 lg:pt-0 lg:pl-6">
                            <div className="mb-3">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">ช่องทางชำระเงิน</p>
                                <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${order.paymentMethod === 'cod' ? 'bg-orange-50 text-orange-700 border-orange-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                                    {order.paymentMethod === 'cod' ? '🚚 เก็บเงินปลายทาง' : '🏦 โอนเงินผ่านธนาคาร'}
                                </span>
                            </div>

                            {order.paymentMethod === 'transfer' && (
                                <div className="mt-auto">
                                    {order.slipImage ? (
                                        <button 
                                            onClick={() => setSelectedSlip(`${API_URL}${order.slipImage}`)}
                                            className="flex items-center gap-3 w-full bg-gray-50 hover:bg-white hover:shadow-md p-2 rounded-xl border border-gray-200 transition-all group"
                                        >
                                            <div className="relative">
                                                <img src={`${API_URL}${order.slipImage}`} className="w-12 h-12 object-cover rounded-lg border border-gray-300" alt="slip mini" />
                                                <div className="absolute inset-0 bg-black/20 rounded-lg group-hover:bg-transparent transition"></div>
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-bold text-gray-700 group-hover:text-blue-600 transition">ตรวจสอบหลักฐาน</p>
                                                <p className="text-[10px] text-gray-400">คลิกเพื่อขยายดูสลิป</p>
                                            </div>
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-red-500 text-sm font-bold bg-red-50 p-2 rounded-lg border border-red-100">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                                            ไม่พบสลิปแนบมา
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}