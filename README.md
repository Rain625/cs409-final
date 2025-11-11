# Recipe Management System - Frontend Application

A modern recipe management web application built with **React + TypeScript**.

---

## 📋 Project Overview

This is a fully featured frontend application for a recipe management system, offering recipe browsing, searching, favoriting, and creation functionalities.  
Users can explore over **13,000 recipes**, manage their personal favorites, and create their own custom recipes.

**Backend API:** https://recipebackend-production-5f88.up.railway.app

---

## ✨ Core Features

### 📖 Recipe Browsing
- **List View:** Supports searching, sorting, and filtering  
- **Gallery View:** Multi-ingredient filtering (AND logic)  
- **Detail View:** View full recipe details with previous/next navigation  

### 🔐 User Authentication
- User registration and login with JWT authentication  
- Password encryption using bcrypt  
- Protected routes for authorized users  

### ❤️ Favorites
- Add and remove favorite recipes  
- View and manage your favorites list  
- Real-time favorite status display  

### 📝 Create Your Own Recipes
- Create, edit, and delete custom recipes  
- Add ingredients, cooking steps, and images  
- View your personal recipe collection  

### 🌐 Cloud Integration
- 13,582+ recipe images stored in MongoDB GridFS  
- All data fetched via RESTful API  
- Secure HTTPS connection  

---

## 📁 Project Structure

```
src/
├── index.tsx                  # App entry file handling React rendering and GitHub Pages routing
├── App.tsx                    # Main app component containing routes, navigation bar, and global state
├── index.css                  # Global styles for all components
│
├── contexts/                  # Global context management
│   └── AuthContext.tsx        # User authentication context for login, register, logout, and auth state
│
├── RecipeDataContext.tsx      # Recipe data management: fetch, cache, search, and pagination
│
├── pages/                     # Page components
│   ├── LoginPage.tsx          # Login page for existing users
│   ├── RegisterPage.tsx       # Registration page for new users
│   ├── FavoritesPage.tsx      # Favorites page displaying user’s saved recipes
│   ├── MyRecipesPage.tsx      # My Recipes page for viewing, editing, and deleting user-created recipes
│   └── CreateRecipePage.tsx   # Create/Edit Recipe page for building or modifying a recipe
│
├── ListView.tsx               # List view component with search, sort, and pagination
├── GalleryView.tsx            # Gallery view supporting multi-ingredient filtering (AND logic)
├── DetailView.tsx             # Detail view showing full recipe info and navigation
├── pageselector.tsx           # Pagination component for previous/next and page jumping
│
├── config/                    # Configuration files
│   └── imageConfig.ts         # Manages image storage and URL generation (MongoDB GridFS)
│
└── styles/                    # CSS styles
    ├── auth.css               # Styles for login/register pages
    └── recipe-form.css        # Styles for recipe creation/editing form
```

---

## 🚀 Getting Started

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm start
```

Visit `http://localhost:3000/mp2`

### Build for Production
```bash
npm run build
```

---

## 🎨 UI Highlights

- 🎯 **Responsive Design:** Works seamlessly on desktop and mobile  
- 🌈 **Modern UI:** Gradient colors, card-style layout, and smooth animations  
- ⚡ **Performance Optimized:** Lazy loading, image error handling, and caching  
- 🔍 **Instant Search:** Live filtering as you type  
- 📄 **Smart Pagination:** 48 items per page with page navigation  

---

## 🔗 API Integration

### Backend Endpoints

- **Recipes:** `/api/recipes` – Fetch recipe list  
- **Auth:** `/api/auth/register`, `/api/auth/login`  
- **Favorites:** `/api/favorites` – Manage favorite recipes  
- **User Recipes:** `/api/user-recipes` – CRUD operations for user-created recipes  
- **Images:** `/api/gridfs-images/:filename` – Fetch recipe images  

All requests are transmitted securely over HTTPS.

---

## 📦 Data Storage

- **User Data:** MongoDB Atlas Cloud Database  
- **Recipe Images:** MongoDB GridFS (13,582+ images)  
- **Authentication:** JWT tokens stored in localStorage  
- **Password Security:** bcrypt with 10 salt rounds  

---
