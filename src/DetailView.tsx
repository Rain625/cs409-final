/**
 * 菜谱详情视图组件
 * 显示完整的菜谱信息，包括食材、做法、图片
 * 支持收藏功能和前后导航
 */
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useRecipeData, Recipe } from "./RecipeDataContext";
import { useAuth } from "./contexts/AuthContext";
import { getImageUrl, PLACEHOLDER_IMAGE } from "./config/imageConfig";
import axios from "axios";
import "./index.css";

const API_BASE_URL = "https://recipebackend-production-5f88.up.railway.app/api";

export default function DetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchRecipeById, allRecipes } = useRecipeData();
  const { isAuthenticated, token } = useAuth();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isIngredientsExpanded, setIsIngredientsExpanded] = useState(false);
  const [isKeyIngredientsExpanded, setIsKeyIngredientsExpanded] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  // 获取菜谱详情
  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchRecipeById(id)
        .then((res) => {
          setRecipe(res);
          setLoading(false);
          if (isAuthenticated && token) {
            checkFavoriteStatus(id);
          }
        })
        .catch((err) => {
          console.error("获取菜谱详情出错:", err);
          setLoading(false);
        });
    }
  }, [id, isAuthenticated, token]);

  // 检查收藏状态
  const checkFavoriteStatus = async (recipeId: string) => {
    if (!isAuthenticated || !token) return;

    try {
      const res = await axios.get(`${API_BASE_URL}/favorites/check/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setIsFavorited(res.data.data.isFavorited);
      }
    } catch (err) {
      console.error("检查收藏状态出错:", err);
    }
  };

  // 切换收藏状态
  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert("请先登录以保存收藏");
      navigate("/login");
      return;
    }

    if (!id) return;
    setFavLoading(true);

    try {
      if (isFavorited) {
        await axios.delete(`${API_BASE_URL}/favorites/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setIsFavorited(false);
      } else {
        await axios.post(
          `${API_BASE_URL}/favorites/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setIsFavorited(true);
      }
    } catch (err: any) {
      console.error("切换收藏状态失败:", err);
      alert(err.response?.data?.message || "操作失败");
    } finally {
      setFavLoading(false);
    }
  };

  if (loading) return <p className="loading-message">Loading recipe...</p>;
  if (!recipe) return <p className="error-message">Recipe not found.</p>;

  const imgUrl = getImageUrl(recipe.imageName);

  // 找到当前菜谱在列表中的位置，用于前后导航
  const currentIndex = allRecipes.findIndex((r) => r._id === recipe._id);
  const prevRecipe = currentIndex > 0 ? allRecipes[currentIndex - 1] : null;
  const nextRecipe = currentIndex < allRecipes.length - 1 ? allRecipes[currentIndex + 1] : null;

  return (
    <div className="detail-container">
      <div className="detail-card">
        <div className="detail-title-row">
          <h2 className="detail-title">
            #{recipe.id} {recipe.title}
          </h2>
          <button
            onClick={handleToggleFavorite}
            className={`btn-favorite ${isFavorited ? "favorited" : ""}`}
            disabled={favLoading}
            title={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            {favLoading ? "..." : (isFavorited ? "❤️ Saved" : "🤍 Save")}
          </button>
        </div>

        <div className="detail-layout">
          <div className="detail-left">
            <img
              src={imgUrl}
              alt={recipe.title}
              className="pokemon-image"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
              }}
            />
          </div>

          <div className="detail-right">
            <div className="info-section">
              <h3>🥘 Ingredients</h3>
              <div className="ingredients-list">
                {recipe.ingredients && recipe.ingredients.length > 0 ? (
                  <>
                    <ul>
                      {recipe.ingredients
                        .filter(ing => ing && typeof ing === 'string')
                        .slice(0, isIngredientsExpanded ? undefined : 4)
                        .map((ingredient, idx) => (
                          <li key={idx}>{ingredient}</li>
                        ))}
                    </ul>
                    {recipe.ingredients.filter(ing => ing && typeof ing === 'string').length > 4 && (
                      <button 
                        className="expand-btn"
                        onClick={() => setIsIngredientsExpanded(!isIngredientsExpanded)}
                      >
                        {isIngredientsExpanded ? '▲ Show Less' : `▼ Show More (${recipe.ingredients.filter(ing => ing && typeof ing === 'string').length - 4} more)`}
                      </button>
                    )}
                  </>
                ) : (
                  <p>No ingredients information available</p>
                )}
              </div>
            </div>

            {recipe.extractedIngredients && recipe.extractedIngredients.length > 0 && (
              <div className="info-section">
                <h3>🌟 Key Ingredients</h3>
                <div className="extracted-ingredients">
                  {recipe.extractedIngredients
                    .filter(ing => ing && typeof ing === 'string')
                    .slice(0, isKeyIngredientsExpanded ? undefined : 9)
                    .map((ing, idx) => (
                      <span key={idx} className="ingredient-tag-large">
                        {ing}
                      </span>
                    ))}
                </div>
                {recipe.extractedIngredients.filter(ing => ing && typeof ing === 'string').length > 9 && (
                  <button 
                    className="expand-btn"
                    onClick={() => setIsKeyIngredientsExpanded(!isKeyIngredientsExpanded)}
                  >
                    {isKeyIngredientsExpanded ? '▲ Show Less' : `▼ Show More (${recipe.extractedIngredients.filter(ing => ing && typeof ing === 'string').length - 9} more)`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {recipe.instructions && (
          <div className="instructions-section">
            <h3>👨‍🍳 Cooking Instructions</h3>
            <div className="instructions-content">
              {recipe.instructions.split('\n').filter(line => line.trim()).map((line, idx) => (
                <div key={idx} className="instruction-step">
                  <div className="step-number">{idx + 1}</div>
                  <div className="step-content">{line}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="nav-buttons">
          {prevRecipe && (
            <button
              onClick={() => navigate(`/recipe/${prevRecipe._id}`)}
              className="btn-nav btn-nav-prev"
              title={`Previous: ${prevRecipe.title}`}
            >
              ←
            </button>
          )}
          {nextRecipe && (
            <button
              onClick={() => navigate(`/recipe/${nextRecipe._id}`)}
              className="btn-nav btn-nav-next"
              title={`Next: ${nextRecipe.title}`}
            >
              →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
