/**
 * 我的收藏页面
 * 显示用户收藏的所有菜谱
 */
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Recipe } from "../RecipeDataContext";
import { getImageUrl, PLACEHOLDER_IMAGE } from "../config/imageConfig";
import axios from "axios";
import "../index.css";

const API_BASE_URL = "https://recipebackend-production-5f88.up.railway.app/api";

export default function FavoritesPage() {
  const { token, isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetchFavorites();
  }, [isAuthenticated, token]);

  const fetchFavorites = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/favorites`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setFavorites(res.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching favorites:", err);
      setError(err.response?.data?.message || "Failed to load favorites");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (recipeId: string) => {
    try {
      await axios.delete(`${API_BASE_URL}/favorites/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFavorites(favorites.filter(r => r._id !== recipeId));
    } catch (err) {
      console.error("Error removing favorite:", err);
      alert("Failed to remove favorite");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>🔐 Please Login</h2>
          <p>You need to be logged in to view your favorites.</p>
          <Link to="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <p className="loading-message">Loading your favorites...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  if (favorites.length === 0) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>❤️ No Favorites Yet</h2>
          <p>Start adding recipes to your favorites!</p>
          <Link to="/list" className="btn-primary">
            Browse Recipes
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>❤️ My Favorite Recipes</h1>
        <p className="subtitle">{favorites.length} recipes saved</p>
      </div>

      <div className="pokemon-grid">
        {favorites.map((recipe) => (
          <div key={recipe._id} className="pokemon-card">
            <Link to={`/recipe/${recipe._id}`}>
              <img
                src={getImageUrl(recipe.imageName)}
                alt={recipe.title}
                className="pokemon-img"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = PLACEHOLDER_IMAGE;
                }}
              />
              <h3 className="pokemon-name">{recipe.title || "Untitled Recipe"}</h3>
            </Link>
            <div className="recipe-ingredients-preview">
              {recipe.extractedIngredients && recipe.extractedIngredients.length > 0 ? (
                recipe.extractedIngredients.slice(0, 3).map((ing, idx) => (
                  <span key={idx} className="ingredient-tag">
                    {ing}
                  </span>
                ))
              ) : (
                <span className="no-ingredients">No ingredients listed</span>
              )}
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                handleRemoveFavorite(recipe._id);
              }}
              className="remove-favorite-btn"
            >
              💔 Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

