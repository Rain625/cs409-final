import React, { createContext, useContext, useState } from "react";
import axios from "axios";

// 后端 API 地址 - 注意：路由在 /api 前缀下
const API_BASE_URL = "https://recipebackend-production-5f88.up.railway.app/api";

// 菜谱接口定义
export interface Recipe {
  _id: string;
  id: number;
  title: string;
  ingredients: string[];
  instructions: string;
  imageName: string;
  extractedIngredients: string[];
}

interface RecipeDataContextType {
  allRecipes: Recipe[];
  recipeCache: Record<string, Recipe>;
  fetchAllRecipes: () => Promise<void>;
  fetchRecipeById: (id: string) => Promise<Recipe>;
  fetchPage: (recipes: Recipe[], page: number, limit?: number) => Recipe[];
  searchRecipes: (query: string, searchMode: "title" | "ingredient") => Recipe[];
}

const RecipeDataContext = createContext<RecipeDataContextType | null>(null);

export function RecipeDataProvider({ children }: { children: React.ReactNode }) {
  const [allRecipes, setAllRecipes] = useState<Recipe[]>([]);
  const [recipeCache, setRecipeCache] = useState<Record<string, Recipe>>({});

  // 获取所有菜谱
  const fetchAllRecipes = async () => {
    if (allRecipes.length > 0) return;
    
    try {
      console.log("正在从后端获取菜谱数据...");
      // 设置limit=50000以获取所有数据（后端默认只返回100条）
      const res = await axios.get(`${API_BASE_URL}/recipes?limit=50000`);
      console.log("API响应:", res.data);
      
      const recipes: Recipe[] = res.data.data;
      setAllRecipes(recipes);
      
      // 缓存所有菜谱
      const cache: Record<string, Recipe> = {};
      recipes.forEach((recipe) => {
        cache[recipe._id] = recipe;
      });
      setRecipeCache(cache);
      
      console.log(`✅ 成功加载 ${recipes.length} 个菜谱`);
    } catch (error) {
      console.error("❌ 获取菜谱列表失败:", error);
      if (axios.isAxiosError(error)) {
        console.error("错误详情:", {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      }
    }
  };

  // 根据 _id 获取单个菜谱详情
  const fetchRecipeById = async (id: string): Promise<Recipe> => {
    if (recipeCache[id]) return recipeCache[id];
    
    try {
      const res = await axios.get(`${API_BASE_URL}/recipes/${id}`);
      const recipe: Recipe = res.data.data;
      setRecipeCache((prev) => ({ ...prev, [id]: recipe }));
      return recipe;
    } catch (error) {
      console.error(`获取菜谱 ${id} 失败:`, error);
      throw error;
    }
  };

  // 分页功能
  const fetchPage = (recipes: Recipe[], page: number, limit = 20): Recipe[] => {
    const start = page * limit;
    const end = start + limit;
    return recipes.slice(start, end);
  };

  // 搜索菜谱
  const searchRecipes = (query: string, searchMode: "title" | "ingredient"): Recipe[] => {
    if (!query) return allRecipes;
    
    const lowerQuery = query.toLowerCase();
    
    return allRecipes.filter((recipe) => {
      try {
        if (searchMode === "title") {
          // 安全检查 title 是否存在
          return recipe.title && recipe.title.toLowerCase().includes(lowerQuery);
        } else {
          // 搜索配料 - 安全检查每个配料是否存在
          const ingredientsMatch = recipe.ingredients && Array.isArray(recipe.ingredients)
            ? recipe.ingredients.some((ing) => ing && typeof ing === 'string' && ing.toLowerCase().includes(lowerQuery))
            : false;
          
          const extractedMatch = recipe.extractedIngredients && Array.isArray(recipe.extractedIngredients)
            ? recipe.extractedIngredients.some((ing) => ing && typeof ing === 'string' && ing.toLowerCase().includes(lowerQuery))
            : false;
          
          return ingredientsMatch || extractedMatch;
        }
      } catch (error) {
        // 如果出现任何错误，跳过这个菜谱
        console.warn(`搜索菜谱 ${recipe._id} 时出错:`, error);
        return false;
      }
    });
  };

  return (
    <RecipeDataContext.Provider
      value={{
        allRecipes,
        recipeCache,
        fetchAllRecipes,
        fetchRecipeById,
        fetchPage,
        searchRecipes,
      }}
    >
      {children}
    </RecipeDataContext.Provider>
  );
}

export function useRecipeData() {
  const ctx = useContext(RecipeDataContext);
  if (!ctx) throw new Error("useRecipeData must be used within RecipeDataProvider");
  return ctx;
}

