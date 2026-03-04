import defaultImg from "../assets/default-img.jpg"
import { Link } from "react-router-dom";
import { getImageUrl } from "../lib/api";

export default function ProductCard({ p }) {

    const formatPrice = (v) =>
        typeof v === 'number'
            ? v.toLocaleString('en-US') + ' $'
            : `${v} USD`;

    return (
        <Link
            key={p._id}
            to={`/product/${p.slug}`}
            className="
            group bg-white rounded-2xl border border-gray-200 shadow-sm
            hover:shadow-xl hover:border-blue-300 hover:-translate-y-1 transition-all duration-300
            block overflow-hidden
            "
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={p.image ? getImageUrl(p.image) : defaultImg}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
            </div>

            <div className="p-4">
                <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{p.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{p?.category?.name || "No category"}</p>
                <p className="mt-2 font-semibold text-gray-900">{formatPrice(p.price)}</p>
            </div>
        </Link>
    )
}

export function ProductCardAlbum({ p }) {

    const formatPrice = (v) =>
        typeof v === 'number'
            ? v.toLocaleString('en-US') + ' $'
            : `${v} USD`;

    return (
        <Link
            key={p._id}
            to={`/product/${p.slug}`}
            className="
            group bg-white rounded-2xl border border-gray-200 shadow-sm
            hover:shadow-xl hover:border-purple-300 hover:-translate-y-1 transition-all duration-300
            block overflow-hidden
            "
        >
            <div className="relative aspect-[4/3] overflow-hidden">
                <img
                    src={p.image ? getImageUrl(p.image) : defaultImg}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
            </div>

            <div className="p-4">
                <h3 className="text-base font-semibold text-gray-900 line-clamp-1">{p.name}</h3>
                <p className="mt-2 font-semibold text-gray-900">{formatPrice(p.price)}</p>
            </div>
        </Link>
    )
}
