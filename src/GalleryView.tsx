/**
 * 图库视图组件
 * 支持按食材多选过滤（AND 逻辑）和分页显示
 */
import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRecipeData, Recipe } from "./RecipeDataContext";
import Pagination from "./pageselector";
import { getImageUrl, PLACEHOLDER_IMAGE } from "./config/imageConfig";

const limit = 48; // 每页显示数量

// 常见食材列表（用于快速筛选）
const commonIngredients = [
  "chicken", "beef", "pork", "fish", "shrimp",
  "rice", "noodles", "pasta", "bread",
  "tomato", "onion", "garlic", "potato", "carrot",
  "cheese", "egg", "milk", "butter"
];

// 骨架屏加载占位组件
function SkeletonCard() {
  return <div className="skeleton-card" />;
}

export default function GalleryView() {
  const { allRecipes, fetchAllRecipes } = useRecipeData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  // 从 URL 参数初始化状态
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(
    searchParams.get("ingredients") ? searchParams.get("ingredients")!.split(',') : []
  );
  const [page, setPage] = useState<number>(Number(searchParams.get("page")) || 0);
  const [activeList, setActiveList] = useState<Recipe[]>([]);

  // 初始化：获取所有菜谱数据
  useEffect(() => {
    fetchAllRecipes().finally(() => setLoading(false));
  }, []);

  // 根据选中的食材过滤菜谱（AND 逻辑：菜谱需包含所有选中的食材）
  useEffect(() => {
    if (selectedIngredients.length > 0) {
      const filtered = allRecipes.filter((recipe) => {
        return selectedIngredients.every((selectedIng) => {
          const lowerIng = selectedIng.toLowerCase();
          
          // 在完整食材列表中查找
          const ingredientsMatch = recipe.ingredients?.some(
            (ing) => ing && typeof ing === 'string' && ing.toLowerCase().includes(lowerIng)
          );
          
          // 在关键食材列表中查找
          const extractedMatch = recipe.extractedIngredients?.some(
            (ing) => ing && typeof ing === 'string' && ing.toLowerCase().includes(lowerIng)
          );
          
          return ingredientsMatch || extractedMatch;
        });
      });
      setActiveList(filtered);
    } else {
      setActiveList(allRecipes);
    }
  }, [selectedIngredients, allRecipes]);

  // 同步状态到 URL 参数
  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedIngredients.length > 0) params.ingredients = selectedIngredients.join(',');
    if (page > 0) params.page = String(page);
    setSearchParams(params);
  }, [selectedIngredients, page]);

  // 切换食材选择状态
  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients((prev) => 
      prev.includes(ingredient) 
        ? prev.filter((item) => item !== ingredient) 
        : [...prev, ingredient]
    );
    setPage(0); // 重置到第一页
  };

  // 分页数据
  const paginated = activeList.slice(page * limit, (page + 1) * limit);

  return (
    <div className="gallery-container">
      <h2 className="gallery-title">🎨 Recipe Gallery</h2>
      <p className="gallery-subtitle">Filter by your favorite ingredients</p>

      <div className="type-buttons">
        {commonIngredients.map((ingredient) => (
          <button
            key={ingredient}
            onClick={() => toggleIngredient(ingredient)}
            className={`type-button ${selectedIngredients.includes(ingredient) ? "active" : ""}`}
            title={`${ingredient} (click to ${selectedIngredients.includes(ingredient) ? 'remove' : 'add'})`}
          >
            {ingredient}
            {selectedIngredients.includes(ingredient) && <span className="checkmark"> ✓</span>}
          </button>
        ))}

        <button
          onClick={() => {
            setSelectedIngredients([]);
            setPage(0);
          }}
          className={`type-button all-button ${selectedIngredients.length === 0 ? "active-all" : ""}`}
        >
          ✨ All {selectedIngredients.length === 0 && <span className="checkmark"> ✓</span>}
        </button>
      </div>
      
      {selectedIngredients.length > 0 && (
        <div className="filter-summary">
          <span className="filter-label">🔍 Filtering by:</span>
          <div className="selected-tags">
            {selectedIngredients.map((ing) => (
              <span key={ing} className="selected-tag">
                {ing}
                <button
                  onClick={() => toggleIngredient(ing)}
                  className="remove-tag"
                  aria-label={`Remove ${ing}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <span className="filter-count">
            Found {activeList.length} recipe{activeList.length !== 1 ? 's' : ''} with ALL selected ingredients
          </span>
        </div>
      )}

      <div className="gallery-grid">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
        ) : paginated.length > 0 ? (
          paginated.map((recipe) => {
            const imgUrl = getImageUrl(recipe.imageName);

            return (
              <Link
                to={`/recipe/${recipe._id}`}
                key={recipe._id}
                className="pokemon-card"
              >
                <img
                  src={imgUrl}
                  alt={recipe.title}
                  className="pokemon-img"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                  }}
                />

                <p className="pokemon-name">{recipe.title || 'Untitled Recipe'}</p>
                <p className="pokemon-id">#{recipe.id}</p>

                <div className="recipe-ingredients-preview">
                  {recipe.extractedIngredients && recipe.extractedIngredients.length > 0 ? (
                    recipe.extractedIngredients.filter(ing => ing && typeof ing === 'string').slice(0, 4).map((ing, idx) => (
                      <span key={idx} className="ingredient-tag">
                        {ing}
                      </span>
                    ))
                  ) : (
                    <span className="ingredient-tag" style={{ background: '#999' }}>No ingredients</span>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <p className="no-results">No recipes match the current filter. Try selecting a different ingredient!</p>
        )}
      </div>

      <Pagination
        page={page}
        total={activeList.length}
        limit={limit}
        onPageChange={(newPage) => {
          setPage(newPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
