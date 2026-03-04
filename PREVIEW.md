# 🛍️ BlogShop - E-commerce & Blogging Platform

A modern full-stack web application combining e-commerce and blogging features, built with React, Express, and MongoDB.

## 📸 Screenshots

### Home Page
Modern landing page with hero section, featured products, latest blog posts, and call-to-action sections.

### Store
Browse products with category filtering and advanced sorting options (price, name, date).

### Blog
Read articles with category filtering and beautiful card layouts.

### Albums
Explore product collections with auto-sliding image galleries on hover.

### Profile
Manage your account settings, profile information, and view statistics.

## ✨ Features

### 🏪 E-commerce
- **Product Management**: Create, edit, and manage products
- **Shop System**: Each user can create their own shop
- **Product Categories**: Organize products by categories
- **Albums**: Create product collections with image galleries
- **Advanced Sorting**: Sort by price, name, or date
- **Responsive Design**: Works on all devices

### 📝 Blogging
- **Create Posts**: Write and publish blog posts
- **Categories**: Organize posts by categories
- **Rich Content**: Support for images and formatted text
- **User Profiles**: View posts by author

### 🎨 UI/UX
- **Modern Design**: Clean, minimal black & white aesthetic
- **Smooth Animations**: Hover effects, transitions, and micro-interactions
- **Responsive Layout**: Mobile-first design
- **Image Sliders**: Auto-sliding galleries on hover
- **Active States**: Visual feedback for current page
- **Loading States**: Skeleton screens for better UX

### 🔐 Authentication
- **User Registration**: Create new accounts
- **Login System**: Secure JWT-based authentication
- **Profile Management**: Update profile information
- **Protected Routes**: Secure user-specific features

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router v6** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **Vite** - Build tool and dev server
- **React Icons** - Icon library

### Backend
- **Node.js** - Runtime environment
- **Express 5** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Multer** - File upload handling
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
my-blog-shop/
├── frontend/
│   └── src/
│       ├── components/      # Reusable components
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   └── ProductCard.jsx
│       ├── pages/          # Page components
│       │   ├── Home.jsx
│       │   ├── Shop.jsx
│       │   ├── Blog.jsx
│       │   ├── Albums.jsx
│       │   └── Contact.jsx
│       ├── users/          # User-related pages
│       │   ├── login.jsx
│       │   ├── register.jsx
│       │   └── userprofile.jsx
│       ├── create/         # Creation pages
│       │   ├── CreateBlogUi.jsx
│       │   ├── AddProducts.jsx
│       │   └── CreateShop.jsx
│       ├── lib/            # Utilities
│       │   ├── api.js
│       │   └── albumsApi.js
│       └── sub/            # Sub-components
│           └── Subnav.jsx
│
└── backend/
    └── server/
        └── src/
            ├── controllers/    # Request handlers
            ├── services/       # Business logic
            ├── models/         # Database schemas
            ├── routes/         # API routes
            ├── middlewares/    # Custom middleware
            ├── validators/     # Input validation
            ├── utils/          # Helper functions
            └── config/         # Configuration files
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd my-blog-shop
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend/server
npm install
```

4. **Configure environment variables**

Create `.env` file in `backend/server/`:
```env
PORT=5000
JWT_SECRET=your_secret_key_here
CORS_ORIGINS=http://localhost:5173
API_BASE_URL=http://localhost:5000
MONGODB_URI=mongodb://localhost:27017/blogshop
```

5. **Start MongoDB**
```bash
mongod
```

6. **Start backend server**
```bash
cd backend/server
npm start
```

7. **Start frontend dev server**
```bash
npm run dev
```

8. **Open browser**
Navigate to `http://localhost:5173`

## 🎯 Key Features Explained

### Image Upload System
- Full URL support for images (works with ngrok)
- Automatic URL generation based on environment
- Fallback to default images
- File validation and size limits

### Album System
- Create collections of products
- Auto-sliding image gallery (5 images max)
- Hover to trigger slide animation
- Click to view full album details

### Sorting & Filtering
- Multiple sort options (price, name, date)
- Category filtering
- Search functionality
- Real-time updates

### Responsive Navigation
- Active page indicators
- Dropdown menus (hover or click mode)
- Click outside to close
- Mobile-friendly

### API Architecture
- RESTful API design
- Controller-Service-Model pattern
- Centralized error handling
- Request validation
- JWT authentication

## 🔧 Configuration

### Vite Proxy
Frontend uses `/api` prefix for API calls in development:
```javascript
// vite.config.js
proxy: {
  '/api': {
    target: 'http://localhost:5000',
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/api/, '')
  }
}
```

### CORS Configuration
Backend allows specific origins:
```javascript
CORS_ORIGINS=http://localhost:5173,https://your-domain.com
```

## 📝 API Endpoints

### Authentication
- `POST /users/register` - Register new user
- `POST /users/login` - Login user
- `GET /users/profile` - Get user profile

### Products
- `GET /products` - Get all products
- `GET /products/:slug` - Get product by slug
- `POST /products` - Create product
- `GET /products/shop/:shopId` - Get products by shop

### Posts
- `GET /posts` - Get all posts
- `GET /posts/:slug` - Get post by slug
- `POST /posts` - Create post
- `GET /posts/me` - Get user's posts

### Albums
- `GET /albums` - Get all albums
- `GET /albums/shop/:shopId/:slug` - Get album by slug
- `POST /albums/shop/:shopId` - Create album
- `POST /albums/:albumId/items` - Add products to album

### Shops
- `GET /shop` - Get all shops
- `GET /shop/id/:id` - Get shop by ID
- `POST /shop` - Create shop
- `GET /shop/me` - Get user's shop

## 🎨 Design System

### Colors
- Primary: Gray/Black (#000000)
- Accent: Red (#EF4444)
- Background: Gray-50 (#F9FAFB)
- Text: Gray-900 (#111827)

### Typography
- Font Family: System fonts
- Headings: Bold, 2xl-4xl
- Body: Regular, base-lg

### Spacing
- Container: max-w-7xl
- Padding: px-6 py-8
- Gap: gap-4 to gap-8

## 🐛 Troubleshooting

### Images not loading
- Check `API_BASE_URL` in `.env`
- Restart backend after changing `.env`
- Verify uploads folder exists

### API 404 errors
- Check vite proxy configuration
- Ensure backend is running
- Verify API routes are correct

### CORS errors
- Add frontend URL to `CORS_ORIGINS`
- Restart backend
- Check browser console for details

## 📚 Documentation

- [Backend Refactoring Guide](backend/server/REFACTORING_GUIDE.md)
- [Image Upload Guide](backend/server/IMAGE_UPLOAD_GUIDE.md)
- [Quick Start](backend/server/QUICK_START.md)
- [Troubleshooting Albums](TROUBLESHOOTING_ALBUMS.md)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- React team for the amazing library
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the database
- All contributors and supporters

---

**Built with ❤️ using React, Express, and MongoDB**
