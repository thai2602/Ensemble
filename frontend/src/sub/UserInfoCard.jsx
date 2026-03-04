import { useEffect, useState } from "react";
import defaultImg from "../assets/default-img.jpg";
import api from "../lib/api";


export default function UserInfoCard({ userId }) {
  const [user, setUser] = useState(null);   

  useEffect(() => {
    if (!userId) return; 

    let cancelled = false;

    api.get(`/users/profile/${userId}`)
      .then(res => { if (!cancelled) setUser(res.data); }) 
      .catch(err => console.error("Load user fail", err));

    return () => { cancelled = true; };
  }, [userId]);

  if (!user) {
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

  const displayName = user.username || "Shop";
  const avatar = user.avatar || defaultImg;

  return (
    <div className="mb-6 rounded-lg bg-white p-4 shadow-md">
      <div className="flex items-center gap-3">
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
      <p className="mt-3 text-sm text-gray-600">
        Sharing our passion and products with love 💖
      </p>
    </div>
  );
}
