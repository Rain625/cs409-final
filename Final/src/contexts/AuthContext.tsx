import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = "https://recipebackend-production-5f88.up.railway.app/api";

interface User {
  _id: string;
  username: string;
  email: string;
  favorites?: string[];
  createdRecipes?: string[];
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  updateUserFavorites: (favorites: string[]) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化：从 localStorage 读取 token
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      
      // 验证 token 是否有效
      verifyToken(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  // 验证 token
  const verifyToken = async (tokenToVerify: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${tokenToVerify}` }
      });
      
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('authUser', JSON.stringify(res.data.data));
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      // Token 无效，清除本地存储
      logout();
    } finally {
      setLoading(false);
    }
  };

  // 登录
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, {
        email,
        password
      });

      if (res.data.success) {
        const { user: userData, token: userToken } = res.data.data;
        setUser(userData);
        setToken(userToken);
        
        // 保存到 localStorage
        localStorage.setItem('authToken', userToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    }
  };

  // 注册
  const register = async (username: string, email: string, password: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/register`, {
        username,
        email,
        password
      });

      if (res.data.success) {
        const { user: userData, token: userToken } = res.data.data;
        setUser(userData);
        setToken(userToken);
        
        // 保存到 localStorage
        localStorage.setItem('authToken', userToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    }
  };

  // 登出
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  // 更新用户收藏列表（本地更新）
  const updateUserFavorites = (favorites: string[]) => {
    if (user) {
      const updatedUser = { ...user, favorites };
      setUser(updatedUser);
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        loading,
        updateUserFavorites
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

