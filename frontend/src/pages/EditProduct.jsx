import { useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import api, { getImageUrl } from "../lib/api";
import { useToast } from '../components/ToastProvider';
import defaultImg from '../assets/default-img.jpg';

const EditProduct = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    details: '',
    price: '',
    quantity: '',
    category: '',
    isFeatured: false,
    image: null,
    currentImage: ''
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get(`/products/${slug}`),
      api.get("/productCategories")
    ])
      .then(([productRes, catsRes]) => {
        const product = productRes.data;
        setFormData({
          name: product.name || '',
          description: product.description || '',
          details: product.details || '',
          price: product.price || '',
          quantity: product.quantity || '',
          category: product.category?._id || '',
          isFeatured: product.isFeatured || false,
          image: null,
          currentImage: product.image || '',
          productId: product._id
        });
        setCategories(catsRes.data);
      })
      .catch(err => {
        console.error("Error loading product:", err);
        addToast('Failed to load product', 'error');
        navigate('/shop');
      })
      .finally(() => setLoading(false));
  }, [slug, navigate, addToast]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    data.append('details', formData.details || '');
    data.append('price', String(formData.price));
    data.append('quantity', String(formData.quantity));
    data.append('category', formData.category);
    data.append('isFeatured', String(formData.isFeatured));
    if (formData.image) data.append('image', formData.image);

    try {
      await api.patch(`/products/${formData.productId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast('Product updated successfully!', 'success');
      navigate(`/product/${slug}`);
    } catch (err) {
      console.error('Error updating product:', err);
      addToast(err.response?.data?.message || 'Failed to update product', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-3xl mx-auto p-6">Loading...</div>;
  }

  const displayImage = preview || (formData.currentImage ? getImageUrl(formData.currentImage) : defaultImg);

  return (
    <div className="min-h-screen bg-white shadow-lg rounded-xl p-6">
      <div className="max-w-3xl mx-auto ">
        <h2 className="text-2xl font-bold mb-6 text-center">Edit Product</h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="text"
            name="name"
            placeholder="Product name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full p-2 border border-gray-300 rounded"
          />

          <textarea
            name="description"
            placeholder="Short description"
            value={formData.description}
            onChange={handleChange}
            rows="2"
            required
            className="w-full p-2 border border-gray-300 rounded"
          />

          <textarea
            name="details"
            placeholder="Product details"
            value={formData.details}
            onChange={handleChange}
            rows="4"
            className="w-full p-2 border border-gray-300 rounded"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="price"
              placeholder="Price"
              value={formData.price}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />

            <input
              type="number"
              name="quantity"
              placeholder="Quantity"
              value={formData.quantity}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Categories</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Select category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
            />
            <label htmlFor="isFeatured" className="text-sm">Outstanding product</label>
          </div>

          <div>
            <label className="block font-medium mb-1">Product photo</label>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleImageChange}
              className="w-full"
            />
            <img
              src={displayImage}
              alt="Preview"
              className="mt-3 max-h-60 rounded-lg border"
              onError={(e) => e.currentTarget.src = defaultImg}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="bg-gray-800 text-white px-6 py-2 rounded-md hover:bg-gray-900 transition duration-200 disabled:opacity-50"
            >
              {submitting ? 'Updating...' : 'Update Product'}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/product/${slug}`)}
              className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition duration-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProduct;
