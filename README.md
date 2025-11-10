# 食谱管理系统 - 前端应用

基于 React + TypeScript 开发的现代化食谱管理 Web 应用

---

## 📋 项目简介

这是一个功能完整的食谱管理系统前端应用，提供食谱浏览、搜索、收藏和创建等功能。用户可以浏览 13,000+ 道菜谱，管理个人收藏，并创建自己的食谱。

**后端 API**：https://recipebackend-production-5f88.up.railway.app

---

## ✨ 核心功能

### 📖 食谱浏览
- **列表视图（List View）**：支持搜索、排序和过滤
- **图库视图（Gallery View）**：按食材多选过滤（AND 逻辑）
- **详情视图（Detail View）**：查看完整食谱信息，支持上一个/下一个导航

### 🔐 用户系统
- 用户注册和登录（JWT 认证）
- 密码加密存储（bcrypt）
- 受保护的路由

### ❤️ 个人收藏
- 收藏喜欢的食谱
- 查看和管理收藏列表
- 实时收藏状态显示

### 📝 创建食谱
- 创建、编辑和删除自定义食谱
- 添加食材、烹饪步骤和图片
- 查看个人食谱集

### 🌐 云端集成
- 13,582+ 张食谱图片存储在 MongoDB GridFS
- 所有数据通过 RESTful API 获取
- HTTPS 安全连接

---


---

## 📁 项目结构

```
src/
├── index.tsx                  # 应用入口文件，处理 React 根组件渲染和 GitHub Pages 路由
├── App.tsx                    # 主应用组件，包含路由配置、导航栏和全局状态管理
├── index.css                  # 全局样式文件，包含所有组件的 CSS 样式
│
├── contexts/                  # 全局状态管理
│   └── AuthContext.tsx        # 用户认证管理，提供登录、注册、登出功能和认证状态
│
├── RecipeDataContext.tsx      # 食谱数据管理，提供数据获取、缓存、搜索和分页功能
│
├── pages/                     # 页面组件
│   ├── LoginPage.tsx          # 登录页面，用户通过邮箱和密码登录
│   ├── RegisterPage.tsx       # 注册页面，新用户创建账号
│   ├── FavoritesPage.tsx      # 收藏页面，显示用户收藏的所有菜谱
│   ├── MyRecipesPage.tsx      # 我的菜谱页面，显示用户创建的菜谱，支持编辑和删除
│   └── CreateRecipePage.tsx   # 创建/编辑菜谱页面，用户创建新菜谱或编辑已有菜谱
│
├── ListView.tsx               # 列表视图组件，显示菜谱列表，支持搜索、排序和分页
├── GalleryView.tsx            # 图库视图组件，支持按食材多选过滤（AND 逻辑）和分页显示
├── DetailView.tsx             # 详情视图组件，显示完整菜谱信息、支持收藏和前后导航
├── pageselector.tsx           # 分页组件，提供上一页、下一页和跳转到指定页功能
│
├── config/                    # 配置文件
│   └── imageConfig.ts         # 图片配置管理，配置图片存储源（MongoDB GridFS）和 URL 生成规则
│
└── styles/                    # 样式文件
    ├── auth.css               # 认证页面样式（登录、注册页面）
    └── recipe-form.css        # 食谱表单样式（创建、编辑页面）
```

---

## 🚀 快速开始

### 安装依赖
```bash
npm install
```

### 启动开发服务器
```bash
npm start
```

访问 `http://localhost:3000/mp2`

### 构建生产版本
```bash
npm run build
```

---

## 🎨 界面特性

- 🎯 **响应式设计**：适配桌面和移动设备
- 🌈 **现代 UI**：渐变色、卡片式布局、流畅动画
- ⚡ **性能优化**：懒加载、图片错误处理、缓存策略
- 🔍 **实时搜索**：输入即时过滤结果
- 📄 **智能分页**：每页 48 项，支持页码跳转

---

## 🔗 API 集成

### 后端 API 端点

- **食谱**：`/api/recipes` - 获取食谱列表
- **认证**：`/api/auth/register`、`/api/auth/login`
- **收藏**：`/api/favorites` - 管理用户收藏
- **用户食谱**：`/api/user-recipes` - CRUD 操作
- **图片**：`/api/gridfs-images/:filename` - 获取图片

所有请求使用 HTTPS 加密传输。

---

## 📦 数据存储

- **用户数据**：MongoDB Atlas 云数据库
- **食谱图片**：MongoDB GridFS（13,582+ 张）
- **身份认证**：JWT Token（localStorage）
- **密码加密**：bcrypt（10 轮加盐）

---


