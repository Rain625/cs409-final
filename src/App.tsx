/**
 * 应用主组件
 * 包含路由配置、导航栏和全局状态管理
 */
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation, useNavigate } from "react-router-dom";
import ListView from "./ListView";
import GalleryView from "./GalleryView";
import DetailView from "./DetailView";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FavoritesPage from "./pages/FavoritesPage";
import MyRecipesPage from "./pages/MyRecipesPage";
import CreateRecipePage from "./pages/CreateRecipePage";
import { RecipeDataProvider } from "./RecipeDataContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./index.css";

// 页面头部组件
function Header() {
  return (
    <header className="header">
      <div className="header-content">
        <span className="header-icon">🍳</span>
        <span className="header-title">Recipe Explorer</span>
        <span className="header-subtitle">Discover Your Next Favorite Dish</span>
      </div>
    </header>
  );
}

// 导航栏组件
function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // 退出登录处理
  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    navigate("/list");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/list" className={`nav-link ${pathname.startsWith("/list") ? "active" : ""}`}>
          <span className="nav-icon">📋</span>
          <span>Recipe List</span>
        </Link>
        <Link to="/gallery" className={`nav-link ${pathname.startsWith("/gallery") ? "active" : ""}`}>
          <span className="nav-icon">🖼️</span>
          <span>Gallery View</span>
        </Link>
        {isAuthenticated && (
          <>
            <Link to="/favorites" className={`nav-link ${pathname.startsWith("/favorites") ? "active" : ""}`}>
              <span className="nav-icon">❤️</span>
              <span>My Favorites</span>
            </Link>
            <Link to="/my-recipes" className={`nav-link ${pathname.startsWith("/my-recipes") ? "active" : ""}`}>
              <span className="nav-icon">📝</span>
              <span>My Recipes</span>
            </Link>
          </>
        )}
      </div>
      <div className="nav-right">
        {isAuthenticated ? (
          <div className="user-menu-container">
            <button
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <span className="nav-icon">👤</span>
              <span>{user?.username}</span>
              <span className="dropdown-arrow">▼</span>
            </button>
            {showUserMenu && (
              <div className="user-dropdown">
                <button onClick={() => { navigate("/my-recipes"); setShowUserMenu(false); }}>
                  📝 My Recipes
                </button>
                <button onClick={() => { navigate("/favorites"); setShowUserMenu(false); }}>
                  ❤️ My Favorites
                </button>
                <button onClick={handleLogout} className="logout-btn">
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link to="/login" className="nav-link auth-link">
              <span className="nav-icon">🔐</span>
              <span>Login</span>
            </Link>
            <Link to="/register" className="nav-link auth-link signup">
              <span className="nav-icon">✨</span>
              <span>Sign Up</span>
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}

// 应用根组件 - 包含全局状态管理和路由
export default function App() {
  return (
    <AuthProvider>
      <RecipeDataProvider>
        <BrowserRouter basename="/cs409-final">
          <Header />
          <Navbar />
          <Routes>
            {/* 默认重定向到列表页 */}
            <Route path="/" element={<Navigate to="/list" />} />
            
            {/* 菜谱浏览页面 */}
            <Route path="/list" element={<ListView />} />
            <Route path="/gallery" element={<GalleryView />} />
            <Route path="/recipe/:id" element={<DetailView />} />
            
            {/* 认证页面 */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* 用户功能页面 */}
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/my-recipes" element={<MyRecipesPage />} />
            <Route path="/create-recipe" element={<CreateRecipePage />} />
            <Route path="/edit-recipe/:id" element={<CreateRecipePage />} />
          </Routes>
        </BrowserRouter>
      </RecipeDataProvider>
    </AuthProvider>
  );
}