import { useEffect, useState } from 'react';
import { listAlbums, createAlbum } from "../lib/albumsApi.js";

export default function ShopAlbums({ shopId, token }) {
  const [albums, setAlbums] = useState([]);
  const [q, setQ] = useState('');
  const [name, setName] = useState('');
  const [theme, setTheme] = useState('');

  const load = async () => {
    const data = await listAlbums(shopId, { q });
    setAlbums(data.items);
  };
  useEffect(() => { load(); }, []);

  const onCreate = async (e) => {
    e.preventDefault();
    await createAlbum(shopId, { name, theme }, token);
    setName(''); setTheme('');
    await load();
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Albums Management</h1>

        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-800">Create New Album</h2>
          <form onSubmit={onCreate} className="flex flex-col sm:flex-row gap-3">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Album name"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <input
              value={theme}
              onChange={e => setTheme(e.target.value)}
              placeholder="Topic (optional)"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
            />
            <button className="px-6 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition shadow-sm">
              Create
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-6">
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Find album..."
              className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
              onKeyDown={e => e.key === 'Enter' && load()}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {albums.map(a => (
              <div key={a.slug} className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition bg-gray-50 hover:border-purple-200">
                <div className="font-bold text-lg text-gray-900">{a.name}</div>
                <div className="text-sm text-gray-600 mt-1">{a.theme || "No theme"}</div>
                <div className="text-xs font-semibold text-purple-600 mt-3">{a.productCount} products</div>
              </div>
            ))}
          </div>
          {albums.length === 0 && (
            <p className="text-center text-gray-500 py-4">No albums found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
