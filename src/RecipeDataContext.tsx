/**
 * 菜谱数据管理 Context
 * 提供全局菜谱数据获取、缓存、搜索和分页功能
 */
import React, { createContext, useContext, useState } from "react";
import axios from "axios";

// 后端 API 地址
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

  // 获取所有菜谱（仅执行一次）
  const fetchAllRecipes = async () => {
    if (allRecipes.length > 0) return;
    
    try {
      // 设置 limit=50000 以获取所有数据（后端默认只返回 100 条）
      const res = await axios.get(`${API_BASE_URL}/recipes?limit=50000`);
      const recipes: Recipe[] = res.data.data;
      setAllRecipes(recipes);
      
      // 构建菜谱缓存（用于快速查找）
      const cache: Record<string, Recipe> = {};
      recipes.forEach((recipe) => {
        cache[recipe._id] = recipe;
      });
      setRecipeCache(cache);
      
      console.log(`✅ 成功加载 ${recipes.length} 个菜谱`);
    } catch (error) {
      console.error("❌ 获取菜谱列表失败:", error);
    }
  };

  // 根据 ID 获取单个菜谱（带缓存）
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

  // 分页功能 - 从菜谱列表中提取指定页的数据
  const fetchPage = (recipes: Recipe[], page: number, limit = 20): Recipe[] => {
    const start = page * limit;
    return recipes.slice(start, start + limit);
  };

  // 搜索菜谱 - 根据标题或食材搜索
  const searchRecipes = (query: string, searchMode: "title" | "ingredient"): Recipe[] => {
    if (!query) return allRecipes;
    
    const lowerQuery = query.toLowerCase();
    
    return allRecipes.filter((recipe) => {
      try {
        if (searchMode === "title") {
          return recipe.title?.toLowerCase().includes(lowerQuery);
        } else {
          // 搜索食材（同时搜索完整食材列表和提取的关键食材）
          const ingredientsMatch = recipe.ingredients?.some(
            (ing) => ing && typeof ing === 'string' && ing.toLowerCase().includes(lowerQuery)
          );
          
          const extractedMatch = recipe.extractedIngredients?.some(
            (ing) => ing && typeof ing === 'string' && ing.toLowerCase().includes(lowerQuery)
          );
          
          return ingredientsMatch || extractedMatch;
        }
      } catch (error) {
        return false; // 出错时跳过该菜谱
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

