import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import api from "../lib/api";
import { useToast } from '../components/ToastProvider';

const AddProduct = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const [categories, setCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    details: '',
    price: '',
    quantity: '',
    category: '',
    isFeatured: false,
    image: null,
  });

  const [preview, setPreview] = useState(null);

  useEffect(() => {
    api.get("/productCategories")
      .then(res => setCategories(res.data))
      .catch(err => console.error("Error loading categories:", err));
  }, []);

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

    const shopId = localStorage.getItem('shopId');

    if (!shopId) {
      addToast('Missing shopId! Please log in or select a shop.', 'error');
      return;
    }

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
      await api.post(`/products/shop/${shopId}`, data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      addToast('Product added successfully!', 'success');
      navigate('/shop');
    } catch (err) {
      console.error('Error adding product:', err.response?.data || err.message);
      addToast(err.response?.data?.message || 'Error sending product to server!', 'error');
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-lg rounded-xl">
        <h2 className="text-2xl font-bold mb-6 text-center">Add New Products</h2>

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
            {preview && (
              <img src={preview} alt="Preview" className="mt-3 max-h-60 rounded-lg border" />
            )}
          </div>

          <button
            type="submit"
            className="bg-gray-700 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition duration-200"
          >
            Add products
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
