import { useEffect, useState } from "react";
import API from "../services/api";

export default function CowsPage() {
  const [cows, setCows] = useState([]);
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [cowRes, prodRes] = await Promise.all([
          API.get("/cows"),
          API.get("/products"),
        ]);
        setCows(cowRes.data || []);
        setProducts(prodRes.data || []);
      } catch (err) {
        console.error("LOAD LIST ERROR:", err.response || err);
      }
    };
    load();
  }, []);

  const medicines = products.filter((p) => p.category === "medicine");
  const supplements = products.filter((p) => p.category === "supplement");
  const others = products.filter((p) => p.category === "other" || !p.category);

  const ItemCard = ({ item }) => (
    <div className="bg-white rounded-xl shadow p-3 text-center text-xs">
      <div className="w-full h-32 bg-gray-200 rounded mb-2 overflow-hidden">
        {item.images?.[0] && (
          <img
            src={`http://localhost:5000${item.images[0]}`}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        )}
      </div>
      <p className="font-semibold mb-1 truncate">{item.name}</p>
      {item.price != null && (
        <p className="text-green-600 font-bold">
          {Number(item.price).toLocaleString()} บาท
        </p>
      )}
      <button className="mt-2 px-4 py-1 rounded-full bg-green-500 text-white text-xs">
        รายละเอียด
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-200 py-8">
      <div className="max-w-6xl mx-auto space-y-10 px-4">
        {/* รายการวัว */}
        <section className="bg-white/60 rounded-2xl py-6 px-3">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-4 mb-1">
              <span className="h-px w-20 bg-black" />
              <span className="font-bold text-lg">รายการ วัว</span>
              <span className="h-px w-20 bg-black" />
            </div>
            <p className="font-semibold text-sm">Cow market</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cows.map((c) => (
              <ItemCard key={c.id} item={c} />
            ))}
          </div>
        </section>

        {/* ยารักษาโรค */}
        <section className="bg-white/60 rounded-2xl py-6 px-3">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-4 mb-1">
              <span className="h-px w-20 bg-black" />
              <span className="font-bold text-lg">ยารักษาโรค</span>
              <span className="h-px w-20 bg-black" />
            </div>
            <p className="font-semibold text-sm">Cow market</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {medicines.map((p) => (
              <ItemCard key={p.id} item={p} />
            ))}
          </div>
        </section>

        {/* อาหารเสริม */}
        <section className="bg-white/60 rounded-2xl py-6 px-3">
          <div className="text-center mb-4">
            <div className="flex items-center justify-center gap-4 mb-1">
              <span className="h-px w-20 bg-black" />
              <span className="font-bold text-lg">อาหารเสริม</span>
              <span className="h-px w-20 bg-black" />
            </div>
            <p className="font-semibold text-sm">Cow market</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {supplements.map((p) => (
              <ItemCard key={p.id} item={p} />
            ))}
          </div>
        </section>

        {/* ⭐ อื่น ๆ */}
        {others.length > 0 && (
          <section className="bg-white/60 rounded-2xl py-6 px-3">
            <div className="text-center mb-4">
              <div className="flex items-center justify-center gap-4 mb-1">
                <span className="h-px w-20 bg-black" />
                <span className="font-bold text-lg">สินค้าอื่น ๆ</span>
                <span className="h-px w-20 bg-black" />
              </div>
              <p className="font-semibold text-sm">Cow market</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {others.map((p) => (
                <ItemCard key={p.id} item={p} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
