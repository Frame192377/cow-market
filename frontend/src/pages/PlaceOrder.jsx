// src/pages/PlaceOrder.jsx
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import API from "../services/api";

const API_URL = "http://localhost:5000";

export default function PlaceOrder() {
  const { state } = useLocation(); 
  const navigate = useNavigate();
  
  const product = state?.product;
  const [qty, setQty] = useState(state?.qty || 1);

  const [form, setForm] = useState({
    customerName: "",
    phoneNumber: "",
    address: "",
    paymentMethod: "cod", 
  });
  const [slipImage, setSlipImage] = useState(null);
  const [previewSlip, setPreviewSlip] = useState(null);
  const [loading, setLoading] = useState(false);

  const sellerBankInfo = {
    bankName: "ธนาคารกสิกรไทย (KBank)",
    accountName: "นายบัญชา สิงห์คำ",
    accountNumber: "012-3-45678-9"
  };

  useEffect(() => {
    if (!product) {
      alert("ไม่พบข้อมูลสินค้า");
      navigate("/products");
    }
  }, [product, navigate]);

  const increaseQty = () => {
    if (product?.stock && qty >= product.stock) {
        alert(`สินค้ามีจำกัดเพียง ${product.stock} ชิ้น`);
        return;
    }
    setQty(prev => prev + 1);
  };

  const decreaseQty = () => {
    if (qty > 1) setQty(prev => prev - 1);
  };

  const productPrice = Number(product?.price || 0);
  const subTotal = productPrice * qty; 
  const shippingCost = subTotal >= 200 ? 0 : 20;
  const grandTotal = subTotal + shippingCost; 

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSlipImage(file);
      setPreviewSlip(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // ✅ ดักจับ: ถ้าเลือกโอนเงิน แล้วไม่มีสลิป ให้หยุดทำงานทันที
    if (form.paymentMethod === "transfer" && !slipImage) {
      alert("กรุณาแนบสลิปการโอนเงินก่อนยืนยัน");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("productId", product.id);
    formData.append("sellerId", product.userId);
    formData.append("customerName", form.customerName);
    formData.append("phoneNumber", form.phoneNumber);
    formData.append("address", form.address);
    formData.append("paymentMethod", form.paymentMethod);
    formData.append("quantity", qty);
    formData.append("shippingCost", shippingCost);
    formData.append("totalPrice", grandTotal);

    if (slipImage) formData.append("slipImage", slipImage);

    try {
      await API.post("/orders", formData);
      alert("สั่งซื้อเรียบร้อย! ระบบแจ้งเตือนผู้ขายแล้ว");
      navigate(`/profile/${product.userId}`); 
    } catch (err) {
      console.error(err);
      alert("เกิดข้อผิดพลาดในการสั่งซื้อ");
    } finally {
      setLoading(false);
    }
  };

  if (!product) return null;

  // ✅ เช็คเงื่อนไขสำหรับปิดปุ่ม (Disable Button)
  // ถ้าเลือกโอนเงิน (transfer) และ ยังไม่มีสลิป (!slipImage) ให้เป็น true
  const isTransferWithoutSlip = form.paymentMethod === 'transfer' && !slipImage;
  const isButtonDisabled = loading || isTransferWithoutSlip;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 font-sans flex flex-col items-center">
      
      {/* ปุ่มย้อนกลับด้านบน */}
      <div className="w-full max-w-4xl mb-6">
        <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-black transition font-bold"
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            ย้อนกลับ
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* ฝั่งซ้าย: สรุปรายการสินค้า */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit">
          <h2 className="text-xl font-bold text-gray-800 mb-4">สรุปคำสั่งซื้อ</h2>
          
          <div className="flex gap-4 mb-4">
            <img 
              src={product.images?.[0] ? `${API_URL}${product.images[0]}` : "https://via.placeholder.com/150"} 
              alt={product.name} 
              className="w-24 h-24 object-cover rounded-lg bg-gray-100"
            />
            <div className="flex-1">
              <h3 className="font-bold text-gray-800 text-lg mb-1">{product.name}</h3>
              <p className="text-gray-500 text-sm mb-2">ราคาต่อชิ้น: {productPrice.toLocaleString()} บ.</p>
              
              <div className="flex items-center gap-3">
                  <div className="flex items-center border border-gray-300 rounded-lg bg-gray-50">
                      <button type="button" onClick={decreaseQty} className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-l-lg font-bold">-</button>
                      <span className="px-3 py-1 font-bold text-gray-800 bg-white min-w-[40px] text-center border-x border-gray-300">{qty}</span>
                      <button type="button" onClick={increaseQty} className="px-3 py-1 text-gray-600 hover:bg-gray-200 rounded-r-lg font-bold">+</button>
                  </div>
                  {product.stock && <span className="text-xs text-gray-400">(เหลือ {product.stock} ชิ้น)</span>}
              </div>
            </div>
          </div>
          
          <div className="space-y-2 border-t border-dashed border-gray-200 pt-4 text-sm">
             <div className="flex justify-between">
                <span className="text-gray-600">ราคาสินค้า ({qty} ชิ้น)</span>
                <span className="font-medium text-gray-900">{subTotal.toLocaleString()} บ.</span>
             </div>
             <div className="flex justify-between">
                <span className="text-gray-600">ค่าจัดส่ง</span>
                {shippingCost === 0 ? <span className="text-green-600 font-bold">ฟรี</span> : <span className="text-red-500 font-medium">+{shippingCost} บ.</span>}
             </div>
             {shippingCost > 0 && <p className="text-[10px] text-gray-400 text-right">*ซื้อครบ 200 บาท ส่งฟรี</p>}
          </div>

          <div className="flex justify-between font-extrabold text-xl mt-4 pt-4 border-t border-gray-200 text-green-700">
            <span>ยอดสุทธิ</span>
            <span>{grandTotal.toLocaleString()} บาท</span>
          </div>
        </div>

        {/* ฝั่งขวา: ฟอร์มข้อมูลจัดส่ง & ชำระเงิน */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">ข้อมูลจัดส่ง & ชำระเงิน</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">ชื่อ-นามสกุล ผู้รับ</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-green-500 focus:border-green-500" value={form.customerName} onChange={e => setForm({...form, customerName: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">เบอร์โทรศัพท์</label>
              <input required type="tel" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-green-500 focus:border-green-500" value={form.phoneNumber} onChange={e => setForm({...form, phoneNumber: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">ที่อยู่จัดส่ง</label>
              <textarea required rows="3" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-green-500 focus:border-green-500" value={form.address} onChange={e => setForm({...form, address: e.target.value})}></textarea>
            </div>

            <div className="pt-4">
              <label className="block text-sm font-bold text-gray-700 mb-3">วิธีการชำระเงิน</label>
              <div className="space-y-3">
                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${form.paymentMethod === 'cod' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:border-green-300'}`}>
                  <input type="radio" name="payment" value="cod" checked={form.paymentMethod === 'cod'} onChange={() => setForm({...form, paymentMethod: 'cod'})} className="w-5 h-5 text-green-600 focus:ring-green-500" />
                  <span className="ml-3 font-bold text-gray-700">🚚 เก็บเงินปลายทาง (COD)</span>
                </label>

                <label className={`flex flex-col p-4 border rounded-xl cursor-pointer transition ${form.paymentMethod === 'transfer' ? 'border-green-500 bg-green-50 ring-1 ring-green-500' : 'border-gray-200 hover:border-green-300'}`}>
                  <div className="flex items-center">
                    <input type="radio" name="payment" value="transfer" checked={form.paymentMethod === 'transfer'} onChange={() => setForm({...form, paymentMethod: 'transfer'})} className="w-5 h-5 text-green-600 focus:ring-green-500" />
                    <span className="ml-3 font-bold text-gray-700">🏦 โอนเงินผ่านธนาคาร</span>
                  </div>
                  
                  {form.paymentMethod === 'transfer' && (
                    <div className="mt-4 ml-8 bg-white p-4 rounded-lg border border-gray-200 shadow-sm animate-fade-in">
                      <p className="text-sm text-gray-500 mb-2">กรุณาโอนเงินมาที่บัญชีผู้ขาย:</p>
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold shrink-0">K</div>
                        <div>
                          <p className="font-bold text-gray-800">{sellerBankInfo.bankName}</p>
                          <p className="text-sm text-gray-600">{sellerBankInfo.accountName}</p>
                        </div>
                      </div>
                      <p className="text-xl font-bold text-green-700 tracking-wider mb-4 border-b border-dashed pb-2">
                        {sellerBankInfo.accountNumber}
                      </p>

                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        แนบสลิปการโอน <span className="text-red-500">*จำเป็น</span>
                      </label>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer"/>
                      
                      {previewSlip ? (
                        <div className="mt-3">
                          <p className="text-xs text-gray-400 mb-1">ตัวอย่างสลิป:</p>
                          <img src={previewSlip} alt="slip" className="h-40 rounded-lg border border-gray-300 object-contain bg-gray-100" />
                        </div>
                      ) : (
                        <p className="text-xs text-red-500 mt-2 font-medium">⚠️ กรุณาอัปโหลดรูปสลิปเพื่อยืนยัน</p>
                      )}
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* ปุ่ม Action */}
            <div className="flex gap-4 mt-6">
                <button 
                    type="button" 
                    onClick={() => navigate(-1)}
                    className="flex-1 py-4 bg-gray-200 text-gray-700 font-bold rounded-xl text-lg hover:bg-gray-300 transition"
                >
                    ยกเลิก
                </button>
                <button 
                    type="submit" 
                    disabled={isButtonDisabled} // ✅ ปิดปุ่มถ้ายังไม่พร้อม
                    className={`flex-[2] py-4 text-white font-bold rounded-xl text-lg transition shadow-lg 
                        ${isButtonDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 shadow-green-200'}
                    `}
                >
                    {loading ? "กำลังดำเนินการ..." : `ยืนยัน (${grandTotal.toLocaleString()} บ.)`}
                </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}