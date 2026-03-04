import { useEffect, useState } from 'react';

import SubNav from '../sub/Subnav';
import { Link } from 'react-router-dom';
import { CiShop } from "react-icons/ci";
import { TbCategory } from "react-icons/tb";
import { BiSolidOffer } from "react-icons/bi";
import { FaShippingFast } from "react-icons/fa";
import api from "../lib/api";

import ProductCard from '../components/ProductCard';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [categories, setCategories] = useState([]);
  const [openCategories, setOpenCategories] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('newest');

  // Filter by category
  const filteredProducts = selectedCategory
    ? products.filter(p => p?.category?.name === selectedCategory)
    : products;

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return (a.price || 0) - (b.price || 0);
      case 'price-high':
        return (b.price || 0) - (a.price || 0);
      case 'newest':
        return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
      case 'oldest':
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      case 'name-asc':
        return (a.name || '').localeCompare(b.name || '');
      case 'name-desc':
        return (b.name || '').localeCompare(a.name || '');
      default:
        return 0;
    }
  });

  const getSortLabel = () => {
    switch (sortBy) {
      case 'price-low': return 'Price: Low to High';
      case 'price-high': return 'Price: High to Low';
      case 'newest': return 'Newest First';
      case 'oldest': return 'Oldest First';
      case 'name-asc': return 'Name: A to Z';
      case 'name-desc': return 'Name: Z to A';
      default: return 'Sort By';
    }
  };

  const subItems = [
    {
      name: (
        <span className='px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition'>
          {getSortLabel()}
        </span>
      ),
      subMenu: [
        <button
          onClick={() => setSortBy('price-low')}
          className={`block w-full text-left px-4 py-2 text-sm transition ${sortBy === 'price-low' ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}
        >
          Price: Low to High
        </button>,
        <button
          onClick={() => setSortBy('price-high')}
          className={`block w-full text-left px-4 py-2 text-sm transition ${sortBy === 'price-high' ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}
        >
          Price: High to Low
        </button>,
        <button
          onClick={() => setSortBy('newest')}
          className={`block w-full text-left px-4 py-2 text-sm transition ${sortBy === 'newest' ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}
        >
          Newest First
        </button>,
        <button
          onClick={() => setSortBy('oldest')}
          className={`block w-full text-left px-4 py-2 text-sm transition ${sortBy === 'oldest' ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}
        >
          Oldest First
        </button>,
        <button
          onClick={() => setSortBy('name-asc')}
          className={`block w-full text-left px-4 py-2 text-sm transition ${sortBy === 'name-asc' ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}
        >
          Name: A to Z
        </button>,
        <button
          onClick={() => setSortBy('name-desc')}
          className={`block w-full text-left px-4 py-2 text-sm transition ${sortBy === 'name-desc' ? 'bg-gray-100 font-semibold' : 'hover:bg-gray-50'}`}
        >
          Name: Z to A
        </button>,
      ]
    }
  ]
  useEffect(() => {
    Promise.all([
      api.get(`/products`),
      api.get(`/productCategories`)
    ])
      .then(([productsRes, categoriesRes]) => {
        setProducts(productsRes.data);
        setCategories(categoriesRes.data);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div id="shop-page" className="space-y-8">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Store</h1>
          <p className="text-gray-600">Buy everything you want!</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid gap-8 lg:grid-cols-[260px_1fr]">
        {/* SIDEBAR */}
        <aside className="lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Categories header */}
            <button
              onClick={() => setOpenCategories(!openCategories)}
              className="w-full flex items-center gap-2 px-4 py-3 border-b border-gray-200 text-gray-800 hover:bg-gray-50"
            >
              <TbCategory size={20} />
              <span className="font-semibold">Categories</span>
              <span className="ml-auto text-gray-400">{openCategories ? '▾' : '▸'}</span>
            </button>

            {/* Categories list */}
            <div className={`transition-[max-height] duration-300 ${openCategories ? 'max-h-96' : 'max-h-0'} overflow-hidden`}>
              <nav className="py-2">
                {categories.map((cat) => (
                  <button
                    key={cat._id}
                    onClick={() => setSelectedCategory(cat.name)}
                    className={`w-full text-left px-5 py-2.5 text-sm rounded-lg hover:bg-blue-50 hover:text-blue-600 transition
                      ${selectedCategory === cat.name ? 'bg-blue-50 font-bold text-blue-700 shadow-sm' : 'text-gray-700'}`}
                  >
                    {cat.name}
                  </button>
                ))}
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="w-full text-left px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
                >
                  Show All
                </button>
              </nav>
            </div>

            <div className="border-t border-gray-200">
              <Link className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <BiSolidOffer size={18} />
                <span>Best Offers</span>
              </Link>
              <Link className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <CiShop size={18} />
                <span>Sell with us</span>
              </Link>
              <Link className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50">
                <FaShippingFast size={18} />
                <span>Track Order</span>
              </Link>
            </div>
          </div>
        </aside>

        {/* PRODUCTS */}
        <section className="min-w-0">
          <div className="inline-block justify-between w-full pr-4">
            <div className='flex w-full justify-between'>
              <h2 className="flex items-center text-2xl font-bold">Products</h2>
              <div className='right-full'> <SubNav items={subItems} title='onclick' /> </div>
            </div>

            {selectedCategory && (
              <span className="text-sm text-gray-500">
                Filter by: <span className="font-medium text-gray-700">{selectedCategory}</span>
              </span>
            )}
          </div>

          {loading ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 animate-pulse">
                  <div className="rounded-xl bg-gray-200 aspect-[4/3]" />
                  <div className="h-4 bg-gray-200 rounded mt-4 w-2/3" />
                  <div className="h-4 bg-gray-200 rounded mt-2 w-1/3" />
                </div>
              ))}
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {sortedProducts.map((p) => (
                <ProductCard key={p._id} p={p} />
              ))}
            </div>
          ) : (
            <div className="mt-12 text-center">
              <p className="text-gray-500 text-lg">No products found.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default Shop;
