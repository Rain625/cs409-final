/**
 * 我的菜谱页面
 * 显示用户创建的所有菜谱，支持编辑和删除
 */
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Recipe } from "../RecipeDataContext";
import { getImageUrl, PLACEHOLDER_IMAGE } from "../config/imageConfig";
import axios from "axios";
import "../index.css";

const API_BASE_URL = "https://recipebackend-production-5f88.up.railway.app/api";

export default function MyRecipesPage() {
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  const [myRecipes, setMyRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    fetchMyRecipes();
  }, [isAuthenticated, token]);

  const fetchMyRecipes = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/user-recipes`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMyRecipes(res.data.data);
      }
    } catch (err: any) {
      console.error("Error fetching user recipes:", err);
      setError(err.response?.data?.message || "Failed to load your recipes");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (recipeId: string) => {
    if (!window.confirm("Are you sure you want to delete this recipe?")) {
      return;
    }

    try {
      await axios.delete(`${API_BASE_URL}/user-recipes/${recipeId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMyRecipes(myRecipes.filter(r => r._id !== recipeId));
    } catch (err) {
      console.error("Error deleting recipe:", err);
      alert("Failed to delete recipe");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>🔐 Please Login</h2>
          <p>You need to be logged in to view your recipes.</p>
          <Link to="/login" className="btn-primary">
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return <p className="loading-message">Loading your recipes...</p>;
  }

  if (error) {
    return <p className="error-message">{error}</p>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <div className="page-header-left">
          <h1>📝 My Recipes</h1>
          <p className="subtitle">{myRecipes.length} recipes created</p>
        </div>
        <button
          onClick={() => navigate("/create-recipe")}
          className="btn-create-recipe"
        >
          ➕ Create New Recipe
        </button>
      </div>

      {myRecipes.length === 0 ? (
        <div className="empty-state">
          <h2>📝 No Recipes Yet</h2>
          <p>Start creating your own recipes!</p>
          <button
            onClick={() => navigate("/create-recipe")}
            className="btn-primary"
          >
            Create Your First Recipe
          </button>
        </div>
      ) : (
        <div className="pokemon-grid">
          {myRecipes.map((recipe) => (
            <div key={recipe._id} className="pokemon-card user-recipe-card">
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
              <div className="recipe-actions">
                <button
                  onClick={() => navigate(`/edit-recipe/${recipe._id}`)}
                  className="btn-edit"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    handleDelete(recipe._id);
                  }}
                  className="btn-delete"
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

