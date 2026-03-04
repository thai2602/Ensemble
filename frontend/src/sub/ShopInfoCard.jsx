import { useEffect, useState } from "react";
import defaultImg from "../assets/default-img.jpg";
import api from "../lib/api";
import { Link } from "react-router-dom";

export default function ShopInfoCard({ shopId }) {
  const [shop, setShop] = useState(null);   

  useEffect(() => {
    if (!shopId) return; 

    let cancelled = false;

    api.get(`/shop/id/${shopId}`)
      .then(res => { if (!cancelled) setShop(res.data); }) 
      .catch(err => console.error("Load data fail", err));

    return () => { cancelled = true; };
  }, [shopId]);

  if (!shop) {
    return (
      <div className="mb-6 rounded-lg bg-white p-4 shadow-md animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-20 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="mt-3 h-4 w-48 bg-gray-200 rounded" />
      </div>
    );
  }

  const displayName = shop.name || "Shop";
  const avatar = shop.avatar || defaultImg;

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
        <Link to={`/shop/${shopId}`} className="block">
        <div className="flex items-center gap-3 hover:bg-gray-50 rounded-md p-2 transition">
            <img
            src={avatar}
            alt={displayName}
            className="h-12 w-12 rounded-full object-cover"
            />
            <div>
            <p className="font-semibold">{displayName}</p>
            <p className="text-sm text-gray-500">Owner</p>
            </div>
        </div>
        </Link>
      <p className="mt-3 text-sm text-gray-600">
        Sharing our passion and products with love 💖
      </p>
    </div>
  );
}
