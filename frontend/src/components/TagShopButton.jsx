import { useEffect, useState } from 'react';
import api from '../lib/api';
import defaultImg from '../assets/default-img.jpg'
import toAbsUrl from '../lib/toAbsUrl';

export default function TagShopButton({ postId, onDone }) {
  const [open, setOpen] = useState(false);
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    api.get('/shop', { params: { q: search.trim() } })
      .then(res => setShops(Array.isArray(res.data?.items) ? res.data.items : []))
      .finally(() => setLoading(false));
  }, [open, search]);

  const tag = async (shopId) => {
    await api.patch(`/posts/${postId}`, { shop: shopId });
    onDone?.();
    setOpen(false);
  };

  const untag = async () => {
    await api.patch(`/posts/${postId}`, { shop: null });
    onDone?.();
    setOpen(false);
  };


  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border px-3 py-1 text-sm hover:bg-gray-50"
      >
        Tag a shop
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-xl rounded-2xl bg-white p-4 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Tag a shop</h3>
              <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-gray-100">✕</button>
            </div>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search shops by name…"
              className="w-full mb-3 rounded-md border px-3 py-2 outline-none focus:border-gray-500"
            />

            <div className="max-h-72 overflow-auto border rounded-md">
              {loading ? (
                <div className="p-4 text-sm text-gray-500">Loading…</div>
              ) : shops.length === 0 ? (
                <div className="p-4 text-sm text-gray-500">No shops</div>
              ) : (
                <ul className="divide-y">
                {shops.map((s) => {
                    const imgSrc = toAbsUrl(s.avatar) || defaultImg; 
                    return (
                    <li key={s._id} className="flex items-center justify-between p-3">
                        <div className="flex items-center gap-3">
                        <img
                            src={imgSrc}
                            alt={s.name}
                            className="h-9 w-9 rounded-full object-cover"
                            onError={(e) => { e.currentTarget.src = defaultImg; }}
                        />
                        <div>
                            <div className="font-medium">{s.name}</div>
                            <div className="text-xs text-gray-500">{s.contact.email}</div>
                        </div>
                        </div>
                        <button
                        onClick={() => tag(s._id)}
                        className="rounded-md border px-3 py-1 text-sm hover:bg-gray-50"
                        >
                        Tag
                        </button>
                    </li>
                    );
                })}
                </ul>
              )}
            </div>

            <div className="mt-3 flex justify-between">
              <button onClick={untag} className="text-red-600 text-sm hover:underline">Remove tag</button>
              <button onClick={() => setOpen(false)} className="text-sm hover:underline">Close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


