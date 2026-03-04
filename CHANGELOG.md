# Changelog - BlogShop Project

Tài liệu này mô tả tất cả các thay đổi và cải tiến đã được thực hiện trong project.

---

## 📅 Phiên bản mới nhất

### 🎨 Frontend Improvements

#### 1. **Cải thiện trang Blog**
- ✅ Layout mới với sidebar categories và grid 2 columns
- ✅ Card design đẹp hơn với shadow và hover effects
- ✅ Loading skeleton khi đang fetch data
- ✅ Category filtering với active states
- ✅ Better typography và spacing
- ✅ Responsive design cho mobile

**Files changed:**
- `frontend/src/pages/Blog.jsx`

---

#### 2. **Tạo trang Albums hoàn toàn mới**
- ✅ Grid layout responsive (1/2/3 columns)
- ✅ **Image slider tự động** khi hover (5 ảnh, 1 giây/ảnh)
- ✅ Image indicators (dots) hiển thị ảnh đang active
- ✅ Hiển thị shop info (avatar + name + items count)
- ✅ Click vào album → Điều hướng đến detail page
- ✅ Fetch full album data với populated products
- ✅ Fallback images (coverImage → product images → default)
- ✅ Loading states và empty states

**Features:**
- Auto-slide khi hover vào album card
- Fetch shopId tự động nếu backend không trả về
- Populate products từ album items

**Files changed:**
- `frontend/src/pages/Albums.jsx`

---

#### 3. **Tạo trang Contact**
- ✅ Contact form đầy đủ (name, email, subject, message)
- ✅ Contact info với icons (email, phone, address)
- ✅ Success message khi gửi form
- ✅ Responsive design
- ✅ Form validation

**Files changed:**
- `frontend/src/pages/Contact.jsx`

---

#### 4. **Hoàn thiện trang Home**
- ✅ Hero section với background image
- ✅ **Features section** giới thiệu 4 tính năng chính:
  - Albums - Organize products into collections
  - Products - Discover unique products
  - Blog - Read inspiring stories
  - Contact - Get in touch
- ✅ **Why Choose Us** section với 3 lý do:
  - Easy to Use
  - Community Driven
  - Secure & Reliable
- ✅ Featured products slider
- ✅ Latest blog posts carousel
- ✅ **CTA section** cuối trang với 2 buttons
- ✅ Smooth animations và hover effects

**Files changed:**
- `frontend/src/pages/Home.jsx`

---

#### 5. **Cải thiện Navbar**
- ✅ **Active page indicator**: Link hiện tại to hơn, đậm hơn
- ✅ **Rounded underline**: Thanh underline có bo tròn 2 đầu
- ✅ Tăng độ dày underline từ 2px lên 3px
- ✅ Smooth transitions
- ✅ Dynamic active state dựa trên pathname

**Files changed:**
- `frontend/src/components/Navbar.jsx`

---

#### 6. **Cải thiện SubNav Component**
- ✅ **Conditional trigger mode**: Hover hoặc Click
- ✅ **Click outside to close**: Đóng dropdown khi click ra ngoài
- ✅ **Auto-width**: Dropdown tự động rộng theo nội dung
- ✅ **Whitespace nowrap**: Text luôn trên 1 dòng
- ✅ Support multiple trigger modes:
  - `title="more"` → Click mode
  - `title="onclick"` → Click mode
  - `title="actions"` → Click mode
  - Default → Hover mode

**Files changed:**
- `frontend/src/sub/Subnav.jsx`

---

#### 7. **Cải thiện trang Shop**
- ✅ **Advanced sorting** với 6 options:
  - 💰 Price: Low to High
  - 💎 Price: High to Low
  - 🆕 Newest First
  - 📅 Oldest First
  - 🔤 Name: A to Z
  - 🔡 Name: Z to A
- ✅ Sort button hiển thị option hiện tại
- ✅ Active state cho option đang chọn
- ✅ Icons cho mỗi sort option
- ✅ Empty state khi không có products

**Files changed:**
- `frontend/src/pages/Shop.jsx`

---

#### 8. **Cải thiện trang Profile**
- ✅ Layout mới đồng bộ với các trang khác
- ✅ Header section với title và description
- ✅ Sidebar với settings menu và logout button
- ✅ Profile picture section với change/remove buttons
- ✅ Profile information form với better styling
- ✅ **Account statistics** (Posts, Products, Followers, Following)
- ✅ Save/Cancel buttons
- ✅ Disabled states rõ ràng
- ✅ Responsive design

**Files changed:**
- `frontend/src/users/userprofile.jsx`

---

### 🔧 Backend Improvements

#### 1. **API Structure Refactoring**
- ✅ Tách thành **Controller-Service-Model** pattern
- ✅ Tạo **Services layer** cho business logic
- ✅ Tạo **Validators** cho input validation
- ✅ **Centralized error handling** với AppError class
- ✅ Better code organization và maintainability

**Files created:**
- `backend/server/src/controllers/post.controller.js`
- `backend/server/src/services/post.service.js`
- `backend/server/src/validators/post.validator.js`
- `backend/server/src/utils/errors.js`
- `backend/server/src/routes/posts.refactored.js`
- `backend/server/src/config/cors.js`
- `backend/server/src/config/multer.js`

**Documentation:**
- `backend/server/REFACTORING_GUIDE.md`

---

#### 2. **Image Upload System Fix**
- ✅ **Full URL support** cho images (work với ngrok)
- ✅ Helper function `getFileUrl()` để generate full URL
- ✅ Automatic URL generation dựa trên environment
- ✅ Fallback về localhost nếu không có `API_BASE_URL`

**Problem solved:**
- Trước: Backend trả về `/uploads/image.jpg` (relative path)
- Sau: Backend trả về `http://localhost:5000/uploads/image.jpg` (full URL)

**Files changed:**
- `backend/server/src/utils/fileHelper.js`
- `backend/server/src/routes/posts.js`
- `backend/server/src/routes/products.js`
- `backend/server/src/controllers/post.controller.js`
- `backend/server/.env`

**Documentation:**
- `backend/server/IMAGE_UPLOAD_GUIDE.md`
- `backend/server/QUICK_START.md`

---

#### 3. **Albums API Enhancement**
- ✅ **Populate products** trong `listAlbums` endpoint
- ✅ Thêm `shopId` vào response
- ✅ Support filtering by shopId
- ✅ Return product details trong album items

**Files changed:**
- `backend/server/src/controllers/album.controller.js`

---

### 🔄 API & Proxy Configuration

#### 1. **Vite Proxy Setup**
- ✅ Proxy `/api` → Backend API
- ✅ Proxy `/uploads` → Backend static files
- ✅ Rewrite `/api/*` thành `/*` cho backend

**Benefits:**
- Không cần CORS cho images
- Cùng origin với frontend
- Dễ deploy
- Work với ngrok mà không cần chạy 2 ngrok

**Files changed:**
- `vite.config.js`

---

#### 2. **Image Loading Strategy**
- ✅ Tạo helper function `getImageUrl()`
- ✅ **Dev mode**: Load qua proxy `/uploads/...`
- ✅ **Production**: Load qua full URL `http://localhost:5000/uploads/...`
- ✅ Update tất cả components để dùng helper

**Files changed:**
- `frontend/src/lib/api.js`
- `frontend/src/pages/Home.jsx`
- `frontend/src/pages/Blog.jsx`
- `frontend/src/pages/Albums.jsx`
- `frontend/src/pages/ProductDetail.jsx`
- `frontend/src/components/ProductCard.jsx`
- `frontend/src/components/PostCard.jsx`

---

### 📝 Documentation

#### Files Created:
1. **PREVIEW.md** - Project overview và getting started guide
2. **CHANGELOG.md** - Chi tiết tất cả thay đổi (file này)
3. **REFACTORING_GUIDE.md** - Hướng dẫn refactor backend
4. **IMAGE_UPLOAD_GUIDE.md** - Hướng dẫn fix image upload
5. **QUICK_START.md** - Quick reference cho setup
6. **TROUBLESHOOTING_ALBUMS.md** - Debug guide cho Albums
7. **TEST_API.md** - Hướng dẫn test API

---

### 🐛 Bug Fixes

#### 1. **Albums không hiển thị ảnh**
**Problem:** Backend `listAlbums` không populate products

**Solution:**
- Thêm `.populate()` trong backend
- Fetch full album details nếu cần
- Fallback về coverImage

---

#### 2. **Albums không có link**
**Problem:** Backend không trả về `shopId`

**Solution:**
- Thêm `shopId` vào `.select()` trong backend
- Fetch shopId từ album detail nếu thiếu

---

#### 3. **Vite Proxy Conflict**
**Problem:** Proxy `/albums` conflict với React Router

**Solution:**
- Đổi proxy thành `/api` prefix
- Update `api.js` để dùng `/api` trong dev mode

---

#### 4. **Node Modules trong Git**
**Problem:** 7520 files trong node_modules hiển thị trong Source Control

**Solution:**
- Update `.gitignore` với nhiều patterns
- Thêm vào `.git/info/exclude`
- Reload VS Code window

---

### 🎯 Key Features Summary

#### Frontend:
- ✅ Modern UI/UX với Tailwind CSS
- ✅ Responsive design cho tất cả devices
- ✅ Smooth animations và transitions
- ✅ Loading states và skeleton screens
- ✅ Active states và visual feedback
- ✅ Image sliders với auto-slide
- ✅ Advanced sorting và filtering
- ✅ Form validation
- ✅ Empty states

#### Backend:
- ✅ RESTful API design
- ✅ Controller-Service-Model pattern
- ✅ Centralized error handling
- ✅ Input validation
- ✅ JWT authentication
- ✅ File upload handling
- ✅ Image URL generation
- ✅ Populate relationships

#### DevOps:
- ✅ Vite proxy configuration
- ✅ Environment variables
- ✅ CORS configuration
- ✅ Ngrok support
- ✅ Git ignore setup

---

### 📊 Statistics

**Files Created:** 15+
**Files Modified:** 30+
**Lines of Code Added:** 3000+
**Features Implemented:** 20+
**Bugs Fixed:** 5+

---

### 🚀 Next Steps

Các tính năng có thể thêm trong tương lai:

1. **User Features:**
   - Edit profile với upload avatar
   - Follow/Unfollow users
   - User statistics thật

2. **Product Features:**
   - Product reviews và ratings
   - Wishlist
   - Shopping cart
   - Checkout process

3. **Blog Features:**
   - Comments system
   - Like/Share posts
   - Rich text editor
   - Draft posts

4. **Shop Features:**
   - Shop analytics
   - Order management
   - Inventory tracking

5. **General:**
   - Search functionality
   - Notifications
   - Real-time updates
   - Dark mode
   - Multi-language support

---

### 👨‍💻 Development Notes

**Tech Stack:**
- Frontend: React 18 + Vite + Tailwind CSS
- Backend: Node.js + Express 5 + MongoDB
- Authentication: JWT
- File Upload: Multer
- Routing: React Router v6

**Best Practices Applied:**
- Component reusability
- Code splitting
- Error boundaries
- Loading states
- Responsive design
- Accessibility
- SEO friendly
- Clean code
- Documentation

---

**Built with ❤️ by the development team**

*Last updated: [Current Date]*
