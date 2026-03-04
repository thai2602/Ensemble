import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAlbum, addProducts, reorder } from "../lib/albumsApi.js";
import { ProductCardAlbum } from "../components/ProductCard.jsx";
import { ArticleSection, ArticleParagraph, ArticleImage } from "../components/ArticleTemplate";

export default function AlbumDetail(props) {
  const params = useParams();
  const shopId = props.shopId ?? params.shopId ?? params.id;
  const slug = props.slug ?? params.slug;

  const [album, setAlbum] = useState(null);
  const [newIds, setNewIds] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const load = async () => {
    if (!shopId || !slug) return;
    try {
      setErr("");
      setLoading(true);
      const data = await getAlbum(shopId, slug);
      setAlbum(data);
    } catch (e) {
      console.error("getAlbum error:", e);
      setErr(e?.response?.data?.message || "Album cannot be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!shopId || !slug) {
      setErr("Missing URL parameter: shopId or slug.");
      return;
    }
    load();
  }, [shopId, slug]);

  const onAdd = async () => {
    try {
      const ids = newIds.split(",").map(s => s.trim()).filter(Boolean);
      if (ids.length === 0) return;

      await addProducts(album._id, ids);
      setNewIds("");
      await load();
    } catch (e) {
      console.error("addProducts error:", e);
      setErr(e?.response?.data?.message || "Add product fail.");
    }
  };

  const onReorder = async () => {
    try {
      const ordered = album.items.map(i => i.product._id);
      await reorder(album._id, ordered);
      await load();
    } catch (e) {
      console.error("reorder error:", e);
      setErr(e?.response?.data?.message || "Lưu thứ tự thất bại.");
    }
  };

  if (!shopId || !slug) {
    return <div className="p-4 text-sm text-red-600">Missing URL parameter: shopId or slug.</div>;
  }

  if (loading && !album) return <div className="p-4">Loading...</div>;
  if (err && !album) return <div className="p-4 text-red-600">{err}</div>;
  if (!album) return null;

  // console.log(
  //   "items len =", album?.items?.length,
  //   "img =", getImg(album?.items?.[0]?.product),
  //   album?.items?.[0]?.product,
  //   "url =", toAbsUrl(album?.items?.[0]?.product.image)
  // );

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{album.name}</h1>
          {album.description && (
            <p className="text-gray-600 text-lg mb-6">{album.description}</p>
          )}

          {/* Cover Image */}
          {album.coverImage && (
            <div className="mt-6 rounded-lg overflow-hidden shadow-md">
              <ArticleImage
                src={album.coverImage}
                alt={album.name}
                className="mb-0"
              />
            </div>
          )}

          {/* Intro Content */}
          <div className="mt-6 space-y-4 text-gray-700">
            <ArticleParagraph className="mb-4">
              This curated collection brings together {album.items?.length || 0} carefully selected items
              that showcase unique design and quality craftsmanship. Each product has been chosen to complement
              the overall theme and aesthetic of this album.
            </ArticleParagraph>

            <ArticleParagraph className="mb-0">
              Explore the collection below to discover products that inspire creativity and reflect
              the vision behind this carefully curated selection. Every item tells a part of the story.
            </ArticleParagraph>
          </div>
        </div>

        {err && <div className="mb-4 text-sm text-red-600 bg-red-50 p-4 rounded-lg">{err}</div>}

        {/* Products Grid */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Collection Items</h2>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {album.items?.map((i) => (
              <ProductCardAlbum key={i.product._id} p={i.product} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
