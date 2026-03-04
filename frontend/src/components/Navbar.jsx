import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { FaRegUser } from "react-icons/fa";
import { FiPlusCircle } from "react-icons/fi";
import { MdOutlineLogin } from "react-icons/md";
import SubNav from "../sub/Subnav";
import api from "../lib/api";

export default function Navbar() {
  const [loginCheck, setLoginCheck] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log(token);

    if (token) {
      setLoginCheck(true);
    } else {
      setLoginCheck(false);
    }
    console.log(loginCheck);

  }, []);

  const { pathname } = useLocation();


  const subItems = [
    {
      name: (
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white hover:bg-gray-900 transition shadow-md cursor-pointer">
          <FiPlusCircle size={20} />
        </div>
      ),
      subMenu: [
        <Link key="product" className="block px-4 py-2 hover:bg-gray-100 text-gray-700" to="/addproduct">
          Add Product
        </Link>,
        <Link key="shop" className="block px-4 py-2 hover:bg-gray-100 text-gray-700" to="/shop/create">
          Create Shop
        </Link>,
        <Link key="blog" className="block px-4 py-2 hover:bg-gray-100 text-gray-700" to="/createBlog">
          Create Blog
        </Link>,
        <Link key="album" className="block px-4 py-2 hover:bg-gray-100 text-gray-700" to="/createAlbum">
          Create Album
        </Link>
      ],
    },

    {
      name: (
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 transition cursor-pointer">
          <FaRegUser size={18} />
        </div>
      ),

      subMenu: [
        <Link key="profile" className="block px-4 py-2 hover:bg-gray-100 text-gray-700" to="/profile">
          My Profile
        </Link>,
        <Link key="myshop" className="block px-4 py-2 hover:bg-gray-100 text-gray-700" to="/my-shop">
          My Shop
        </Link>,
        <div key="divider" className="border-t border-gray-200 my-1" />,
        <div
          key="logout"
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('shopId');
            window.location.href = '/login';
          }}
          className="w-full text-left block px-4 py-2 hover:bg-red-50 text-red-600 cursor-pointer"
        >
          Logout
        </div>,
      ],
    },
  ];



  const [keyword, setKeyword] = useState("");
  const [searchType, setSearchType] = useState("all"); // all, products, posts
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchResults, setSearchResults] = useState({ products: [], posts: [] });
  const [showResults, setShowResults] = useState(false);
  const [searching, setSearching] = useState(false);
  const navigate = useNavigate();

  // Debounced search
  useEffect(() => {
    if (!keyword.trim()) {
      setSearchResults({ products: [], posts: [] });
      setShowResults(false);
      return;
    }

    const timer = setTimeout(() => {
      performSearch(keyword);
    }, 300);

    return () => clearTimeout(timer);
  }, [keyword, searchType]);

  const performSearch = async (query) => {
    if (!query.trim()) return;

    setSearching(true);
    try {
      const results = { products: [], posts: [] };

      if (searchType === "all" || searchType === "products") {
        const { data } = await api.get('/products', {
          params: { search: query }
        });
        results.products = Array.isArray(data) ? data.slice(0, 5) : [];
      }

      if (searchType === "all" || searchType === "posts") {
        const { data } = await api.get('/posts', {
          params: { search: query }
        });
        results.posts = Array.isArray(data) ? data.slice(0, 5) : [];
      }

      setSearchResults(results);
      setShowResults(true);
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setSearching(false);
    }
  };

  const onSearch = (e) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    // Navigate to search results page
    navigate(`/search?q=${encodeURIComponent(keyword)}&type=${searchType}`);
    setKeyword("");
    setShowResults(false);
  };

  const handleClearSearch = () => {
    setKeyword("");
    setSearchResults({ products: [], posts: [] });
    setShowResults(false);
  };

  return (
    <nav className="fixed inset-x-0 top-0 z-50 bg-white backdrop-blur border-b border-gray-200 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        {/* Logo */}
        <Link
          to="/"
          className="text-black font-bold text-2xl tracking-wide hover:opacity-80"
        >
          BlogShop
        </Link>

        {/* Search */}
        <form onSubmit={onSearch} className="hidden md:block flex-1 relative">
          <div className="relative mx-auto max-w-xl">
            {/* Input */}
            <input
              type="text"
              placeholder={`Search ${searchType === "all" ? "everything" : searchType}...`}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => keyword && setShowResults(true)}
              className="
              w-full py-3 pl-4 pr-32
              rounded-full bg-white
              border border-gray-300
              text-gray-800 placeholder-gray-400
              shadow-sm outline-none
              focus:border-gray-500 focus:ring-2 focus:ring-gray-100
              transition
            "
            />

            <div className="absolute inset-y-0 right-12 flex items-center gap-2 px-2">
              {keyword && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="text-gray-400 hover:text-gray-600 text-xl font-bold"
                  aria-label="Clear search input"
                >
                  ×
                </button>
              )}

              {/* Dropdown trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="text-gray-600 hover:text-black text-sm font-medium whitespace-nowrap"
                >
                  {searchType === "all" ? "All" : searchType === "products" ? "Products" : "Posts"} ▾
                </button>

                {/* Dropdown menu */}
                {showDropdown && (
                  <div className="absolute right-0 top-full mt-2 w-32 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      type="button"
                      onClick={() => { setSearchType("all"); setShowDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${searchType === "all" ? "bg-gray-50 font-semibold" : ""}`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSearchType("products"); setShowDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${searchType === "products" ? "bg-gray-50 font-semibold" : ""}`}
                    >
                      Products
                    </button>
                    <button
                      type="button"
                      onClick={() => { setSearchType("posts"); setShowDropdown(false); }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${searchType === "posts" ? "bg-gray-50 font-semibold" : ""}`}
                    >
                      Posts
                    </button>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className="
              absolute right-2 top-1/2 -translate-y-1/2
              h-9 w-9 rounded-full
              bg-gray-700 text-white
              grid place-items-center
              shadow-md hover:bg-gray-800 active:scale-95
              outline-none focus:ring-2 focus:ring-gray-200
              transition z-10
            "
              aria-label="Search"
            >
              <IoIosSearch size={18} />
            </button>

            {/* Search Results Dropdown */}
            {showResults && keyword && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-50">
                {searching ? (
                  <div className="p-4 text-center text-gray-500">Searching...</div>
                ) : (
                  <>
                    {/* Products Results */}
                    {searchResults.products.length > 0 && (
                      <div className="border-b border-gray-100">
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                          Products
                        </div>
                        {searchResults.products.map((product) => (
                          <Link
                            key={product._id}
                            to={`/products/${product.slug || product._id}`}
                            onClick={() => { setShowResults(false); setKeyword(""); }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                          >
                            <img
                              src={product.image || product.images?.[0] || "/default-img.jpg"}
                              alt={product.name}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{product.name}</p>
                              <p className="text-sm text-gray-500">${product.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* Posts Results */}
                    {searchResults.posts.length > 0 && (
                      <div>
                        <div className="px-4 py-2 bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                          Posts
                        </div>
                        {searchResults.posts.map((post) => (
                          <Link
                            key={post._id}
                            to={`/blog/${post.slug}`}
                            onClick={() => { setShowResults(false); setKeyword(""); }}
                            className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition"
                          >
                            <img
                              src={post.image || "/default-img.jpg"}
                              alt={post.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">{post.title}</p>
                              <p className="text-sm text-gray-500 truncate">{post.summary}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                    )}

                    {/* No Results */}
                    {searchResults.products.length === 0 && searchResults.posts.length === 0 && (
                      <div className="p-4 text-center text-gray-500">
                        No results found for "{keyword}"
                      </div>
                    )}

                    {/* View All Results */}
                    {(searchResults.products.length > 0 || searchResults.posts.length > 0) && (
                      <button
                        type="submit"
                        className="w-full px-4 py-3 text-center text-sm font-medium text-gray-700 hover:bg-gray-50 border-t border-gray-100"
                      >
                        View all results for "{keyword}"
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Backdrop to close results */}
          {showResults && (
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowResults(false)}
            />
          )}
        </form>



        {/* Menu */}
        <div className="hidden md:flex h-16 items-center gap-6 text-md font-semibold px-8">
          <Link
            to="/"
            className={`
            relative inline-flex items-center h-10 leading-none
            text-gray-700 hover:text-black transition-all
            after:content-[''] after:absolute after:left-0 after:bottom-0
            after:h-[3px] after:w-0 after:bg-black after:transition-all after:rounded-full
            ${pathname === '/' ? 'text-black font-bold text-lg after:w-full' : ''}
          `}
          >
            Home
          </Link>

          <Link
            to="/shop"
            className={`
            relative inline-flex items-center h-10 leading-none
            text-gray-700 hover:text-black transition-all
            after:content-[''] after:absolute after:left-0 after:bottom-0
            after:h-[3px] after:w-0 after:bg-black after:transition-all after:rounded-full
            ${pathname === '/shop' ? 'text-black font-bold text-lg after:w-full' : ''}
          `}
          >
            Store
          </Link>

          <Link
            to="/blog"
            className={`
            relative inline-flex items-center h-10 leading-none
            text-gray-700 hover:text-black transition-all
            after:content-[''] after:absolute after:left-0 after:bottom-0
            after:h-[3px] after:w-0 after:bg-black after:transition-all after:rounded-full
            ${pathname === '/blog' ? 'text-black font-bold text-lg after:w-full' : ''}
          `}
          >
            Blog
          </Link>

          <Link
            to="/albums"
            className={`
            relative inline-flex items-center h-10 leading-none
            text-gray-700 hover:text-black transition-all
            after:content-[''] after:absolute after:left-0 after:bottom-0
            after:h-[3px] after:w-0 after:bg-black after:transition-all after:rounded-full
            ${pathname === '/albums' ? 'text-black font-bold text-lg after:w-full' : ''}
          `}
          >
            Albums
          </Link>


          <Link
            to="/contact"
            className={`
            relative inline-flex items-center h-10 leading-none
            text-gray-700 hover:text-black transition-all
            after:content-[''] after:absolute after:left-0 after:bottom-0
            after:h-[3px] after:w-0 after:bg-black after:transition-all after:rounded-full
            ${pathname === '/contact' ? 'text-black font-bold text-lg after:w-full' : ''}
          `}
          >
            Contact
          </Link>


        </div>
        {loginCheck ? <AfterLogin subItems={subItems} /> : <BeforeLogin />}


      </div>
    </nav>
  );
}


const AfterLogin = ({ subItems }) => {

  return (
    <div className="ml-auto flex items-center gap-2">
      <SubNav items={subItems} />
    </div>
  )

}

const BeforeLogin = () => {
  const navigate = useNavigate();
  return (
    <div className="ml-auto flex items-center gap-3">
      <button
        onClick={() => navigate('/login')}
        className="px-6 py-2 text-gray-700 font-medium hover:text-gray-900 transition"
      >
        Login
      </button>
      <button
        onClick={() => navigate('/register')}
        className="px-6 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900 transition shadow-md"
      >
        Sign Up
      </button>
    </div>
  )
};