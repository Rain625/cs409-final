import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useRecipeData, Recipe } from "./RecipeDataContext";
import Pagination from "./pageselector";
import { getImageUrl, PLACEHOLDER_IMAGE } from "./config/imageConfig";

const limit = 48;

// 常见配料分类
const commonIngredients = [
  "chicken", "beef", "pork", "fish", "shrimp",
  "rice", "noodles", "pasta", "bread",
  "tomato", "onion", "garlic", "potato", "carrot",
  "cheese", "egg", "milk", "butter"
];

function SkeletonCard() {
  return <div className="skeleton-card" />;
}

export default function GalleryView() {
  const { allRecipes, fetchAllRecipes } = useRecipeData();
  const [searchParams, setSearchParams] = useSearchParams();

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>(
    searchParams.get("ingredients") ? searchParams.get("ingredients")!.split(',') : []
  );
  const [page, setPage] = useState<number>(Number(searchParams.get("page")) || 0);

  const [activeList, setActiveList] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAllRecipes().finally(() => setLoading(false));
  }, []);

  // 使用 AND 逻辑过滤菜谱
  useEffect(() => {
    if (selectedIngredients.length > 0) {
      const filtered = allRecipes.filter((recipe) => {
        // 检查菜谱是否包含所有选中的食材（AND 逻辑）
        return selectedIngredients.every((selectedIng) => {
          const lowerIng = selectedIng.toLowerCase();
          const ingredientsMatch = recipe.ingredients && Array.isArray(recipe.ingredients)
            ? recipe.ingredients.some((ing) => ing && typeof ing === 'string' && ing.toLowerCase().includes(lowerIng))
            : false;
          
          const extractedMatch = recipe.extractedIngredients && Array.isArray(recipe.extractedIngredients)
            ? recipe.extractedIngredients.some((ing) => ing && typeof ing === 'string' && ing.toLowerCase().includes(lowerIng))
            : false;
          
          return ingredientsMatch || extractedMatch;
        });
      });
      setActiveList(filtered);
    } else {
      setActiveList(allRecipes);
    }
  }, [selectedIngredients, allRecipes]);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (selectedIngredients.length > 0) params.ingredients = selectedIngredients.join(',');
    if (page > 0) params.page = String(page);
    setSearchParams(params);
  }, [selectedIngredients, page]);

  // 切换食材选择
  const toggleIngredient = (ingredient: string) => {
    setSelectedIngredients((prev) => {
      if (prev.includes(ingredient)) {
        return prev.filter((item) => item !== ingredient);
      } else {
        return [...prev, ingredient];
      }
    });
    setPage(0);
  };

  const paginated = activeList.slice(page * limit, (page + 1) * limit);
  const total = activeList.length;

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
        total={total}
        limit={limit}
        onPageChange={(newPage) => {
          setPage(newPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}
