# Blog-shop

Blog-shop is a dedicated platform designed to empower small shop owners to showcase their passion in a professional and organized way. Unlike scattered social media posts, Blog-shop provides a centralized space to build trust and credibility with customers.

Built with **React, Vite, Tailwind, Node.js, Express, MongoDB**.

## ✨ Features

- **Professional Shop Showcase**: Organize products and stories in a dedicated space.
- **Blog System**: Share stories, updates, and engage with customers.
- **Product Management**: Create, edit, and delete products easily.
- **User Authentication**: Secure login and registration for shop owners and users.
- **Toast Notifications**: Modern, non-intrusive alerts for user actions (success, error, info).
- **Responsive Design**: optimized for various devices using Tailwind CSS.
- **Security**: Role-based access control for managing content (only owners can edit/delete their items).

## 🛠 Technologies

- **Frontend**: React + Vite + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB
- **Key Libraries**:
  - `axios` (API requests)
  - `react-router-dom` (Navigation)
  - `mongoose` (Database modeling)
  - `jsonwebtoken` (Authentication)
  - `multer` (File uploads)

## 🚀 Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/thai2602/Blog-shop.git
    cd Blog-shop
    ```

2.  **Install dependencies:**
    
    *   **Frontend**:
        ```bash
        npm install
        ```
    
    *   **Backend**:
        ```bash
        cd backend/server
        npm install
        ```

## ⚙️ Environment Variables

Create a `.env` file in the appropriate directories before running the project.

### Backend (`backend/server/.env`)
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

### Frontend (`.env`)
```env
VITE_API_BASE=http://localhost:5000
```

## ▶️ Running the Project

To run the application locally, you need to start both the backend and frontend servers.

### Backend
```bash
# In backend/server directory
npm start server
```

### Frontend
```bash
# In root directory
npm run dev
```

## 📂 Project Structure

```
blog-shop/
├── frontend/
│   └── src/
│       ├── components/      # Reusable UI components (Navbar, Footer, Toast, etc.)
│       ├── pages/          # Main application pages (Home, Shop, Blog, etc.)
│       ├── users/          # Authentication & Profile pages
│       ├── create/         # Content creation pages (Blogs, Products)
│       ├── lib/            # API & Utility functions
│       └── sub/            # Sub-components
│
└── backend/
    └── server/
        └── src/
            ├── controllers/    # Request logic
            ├── services/       # Business logic
            ├── models/         # Database schemas
            ├── routes/         # API endpoints
            ├── middlewares/    # Auth & Error handling
            └── config/         # App configuration
```
 
