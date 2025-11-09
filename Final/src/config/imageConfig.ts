// Image Configuration
// 图片存储配置

// 图片基础URL配置
// 可以切换不同的图片存储方案

export const IMAGE_CONFIG = {
  // 方案1: 本地图片（默认）
  LOCAL: `${process.env.PUBLIC_URL}/Food Images`,
  
  // 方案2: MongoDB GridFS（图片存储在 MongoDB 云端）
  MONGODB_GRIDFS: 'https://recipebackend-production-5f88.up.railway.app/api/gridfs-images',
  MONGODB_GRIDFS_LOCAL: 'http://localhost:3000/api/gridfs-images',
  
  // 方案3: 文件系统 API（备用）
  BACKEND_API: 'https://recipebackend-production-5f88.up.railway.app/api/images',
  BACKEND_API_LOCAL: 'http://localhost:3000/api/images',
  
  // 方案3: Cloudinary
  // 1. 注册 https://cloudinary.com (免费25GB)
  // 2. 上传图片到 Cloudinary
  // 3. 替换 YOUR_CLOUD_NAME
  CLOUDINARY: 'https://res.cloudinary.com/YOUR_CLOUD_NAME/image/upload/recipes',
  
  // 方案4: Imgur
  IMGUR: 'https://i.imgur.com',
  
  // 方案5: GitHub + jsDelivr CDN
  // 格式: https://cdn.jsdelivr.net/gh/username/repo@branch/path
  GITHUB_CDN: 'https://cdn.jsdelivr.net/gh/username/recipe-images@main/Food%20Images',
  
  // 方案6: 自定义 CDN
  CUSTOM_CDN: 'https://your-custom-cdn.com/images',
};

// 当前使用的配置 - 修改这里来切换图片源
// 使用 MongoDB GridFS 云端 - 图片存储在 MongoDB Atlas 云端
export const CURRENT_IMAGE_BASE = IMAGE_CONFIG.MONGODB_GRIDFS;

// 图片URL生成函数
export const getImageUrl = (imageName: string): string => {
  if (!imageName) {
    return 'https://via.placeholder.com/400x400?text=No+Image';
  }
  
  // 根据不同的配置返回不同的URL格式
  if (CURRENT_IMAGE_BASE === IMAGE_CONFIG.MONGODB_GRIDFS || 
      CURRENT_IMAGE_BASE === IMAGE_CONFIG.MONGODB_GRIDFS_LOCAL) {
    // MongoDB GridFS 格式
    return `${CURRENT_IMAGE_BASE}/${imageName}`;
  } else if (CURRENT_IMAGE_BASE === IMAGE_CONFIG.BACKEND_API || 
      CURRENT_IMAGE_BASE === IMAGE_CONFIG.BACKEND_API_LOCAL) {
    // 文件系统 API 格式
    return `${CURRENT_IMAGE_BASE}/${imageName}`;
  } else if (CURRENT_IMAGE_BASE === IMAGE_CONFIG.CLOUDINARY) {
    // Cloudinary 支持自动优化
    // w_400,h_400,c_fill 表示裁剪为 400x400
    return `${CURRENT_IMAGE_BASE}/w_400,h_400,c_fill/${imageName}.jpg`;
  } else if (CURRENT_IMAGE_BASE === IMAGE_CONFIG.IMGUR) {
    // Imgur 格式
    return `${CURRENT_IMAGE_BASE}/${imageName}.jpg`;
  } else {
    // 默认格式（本地/GitHub/自定义CDN）
    return `${CURRENT_IMAGE_BASE}/${imageName}.jpg`;
  }
};

// 占位图片
export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400?text=No+Image';

// 导出配置说明
export const IMAGE_CONFIG_DOCS = {
  setup: {
    backendApi: {
      steps: [
        '1. 将图片上传到后端服务器 Recipe_Backend/uploads/images/',
        '2. 后端提供 /api/images/:imageName 接口',
        '3. 配置已完成，图片通过 API 访问',
        '4. 在 Railway 中创建 Volume 挂载到 /app/uploads',
      ],
      benefits: [
        '✅ 所有数据统一在 MongoDB + Backend',
        '✅ RESTful API 一致性',
        '✅ 无需额外的云服务账号',
        '✅ 便于权限控制和管理',
        '⚠️ 需要服务器存储空间',
      ],
      deployment: [
        '部署到 Railway:',
        '1. 在 Railway Dashboard 创建 Volume',
        '2. 挂载路径: /app/uploads',
        '3. 大小: 5GB (根据需求调整)',
        '4. 通过 Railway CLI 或 SFTP 上传图片',
      ],
    },
    cloudinary: {
      steps: [
        '1. 注册 Cloudinary: https://cloudinary.com',
        '2. 创建一个 upload preset',
        '3. 批量上传图片到 recipes 文件夹',
        '4. 更新 CLOUDINARY URL 中的 YOUR_CLOUD_NAME',
        '5. 修改 CURRENT_IMAGE_BASE = IMAGE_CONFIG.CLOUDINARY',
      ],
      benefits: [
        '✅ 自动图片优化和压缩',
        '✅ CDN 全球加速',
        '✅ 免费 25GB 存储和流量',
        '✅ 支持按需调整大小',
      ],
    },
    github: {
      steps: [
        '1. 创建 GitHub 仓库 (public)',
        '2. 上传 Food Images 文件夹',
        '3. 更新 GITHUB_CDN URL (username/repo)',
        '4. 修改 CURRENT_IMAGE_BASE = IMAGE_CONFIG.GITHUB_CDN',
      ],
      benefits: [
        '✅ 完全免费',
        '✅ jsDelivr CDN 加速',
        '✅ 版本控制',
        '⚠️ 单文件不超过 100MB',
      ],
    },
  },
};

