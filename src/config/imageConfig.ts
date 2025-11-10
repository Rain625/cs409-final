/**
 * 图片配置管理
 * 配置图片存储源和 URL 生成规则
 */

// 图片存储配置选项
export const IMAGE_CONFIG = {
  // MongoDB GridFS（当前使用 - 图片存储在 MongoDB Atlas 云端）
  MONGODB_GRIDFS: 'https://recipebackend-production-5f88.up.railway.app/api/gridfs-images',
  MONGODB_GRIDFS_LOCAL: 'http://localhost:3000/api/gridfs-images',
  
  // 本地图片（备用）
  LOCAL: `${process.env.PUBLIC_URL}/Food Images`,
};

// 当前使用的图片源
export const CURRENT_IMAGE_BASE = IMAGE_CONFIG.MONGODB_GRIDFS;

// 占位图片
export const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400?text=No+Image';

/**
 * 生成图片 URL
 * @param imageName 图片文件名
 * @returns 完整的图片 URL
 */
export const getImageUrl = (imageName: string): string => {
  if (!imageName) {
    return PLACEHOLDER_IMAGE;
  }
  
  // MongoDB GridFS 或本地文件格式
  return `${CURRENT_IMAGE_BASE}/${imageName}`;
};

