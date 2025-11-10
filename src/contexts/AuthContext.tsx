/**
 * 用户认证管理 Context
 * 提供用户注册、登录、登出和认证状态管理
 */
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

  // 初始化：从本地存储恢复登录状态
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      verifyToken(storedToken); // 验证 token 是否仍然有效
    } else {
      setLoading(false);
    }
  }, []);

  // 验证 token 有效性
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
      console.error('Token 验证失败:', error);
      logout(); // Token 无效，清除登录状态
    } finally {
      setLoading(false);
    }
  };

  // 用户登录
  const login = async (email: string, password: string) => {
    try {
      const res = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });

      if (res.data.success) {
        const { user: userData, token: userToken } = res.data.data;
        setUser(userData);
        setToken(userToken);
        localStorage.setItem('authToken', userToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      throw new Error(error.response?.data?.message || '登录失败');
    }
  };

  // 用户注册
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
        localStorage.setItem('authToken', userToken);
        localStorage.setItem('authUser', JSON.stringify(userData));
      }
    } catch (error: any) {
      console.error('注册失败:', error);
      throw new Error(error.response?.data?.message || '注册失败');
    }
  };

  // 用户登出
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  // 更新用户收藏列表（仅更新本地状态）
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

