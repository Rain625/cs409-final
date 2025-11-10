/**
 * 创建/编辑菜谱页面
 * 用户创建新菜谱或编辑已有菜谱
 */
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import axios from "axios";
import "../styles/recipe-form.css";

const API_BASE_URL = "https://recipebackend-production-5f88.up.railway.app/api";

export default function CreateRecipePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, isAuthenticated } = useAuth();
  
  const isEditMode = !!id;

  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([""]);
  const [instructions, setInstructions] = useState("");
  const [extractedIngredients, setExtractedIngredients] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isEditMode && id) {
      fetchRecipe(id);
    }
  }, [id, isEditMode]);

  const fetchRecipe = async (recipeId: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/recipes/${recipeId}`);
      const recipe = res.data.data;
      
      setTitle(recipe.title || "");
      setIngredients(recipe.ingredients && recipe.ingredients.length > 0 ? recipe.ingredients : [""]);
      setInstructions(recipe.instructions || "");
      setExtractedIngredients(recipe.extractedIngredients && recipe.extractedIngredients.length > 0 ? recipe.extractedIngredients : [""]);
    } catch (err) {
      console.error("Error fetching recipe:", err);
      setError("Failed to load recipe");
    }
  };

  // 食材列表处理
  const handleIngredientChange = (index: number, value: string) => {
    const newIngredients = [...ingredients];
    newIngredients[index] = value;
    setIngredients(newIngredients);
  };

  const addIngredient = () => setIngredients([...ingredients, ""]);
  const removeIngredient = (index: number) => {
    if (ingredients.length > 1) {
      setIngredients(ingredients.filter((_, i) => i !== index));
    }
  };

  // 关键食材列表处理
  const handleKeyIngredientChange = (index: number, value: string) => {
    const newKeyIngredients = [...extractedIngredients];
    newKeyIngredients[index] = value;
    setExtractedIngredients(newKeyIngredients);
  };

  const addKeyIngredient = () => setExtractedIngredients([...extractedIngredients, ""]);
  const removeKeyIngredient = (index: number) => {
    if (extractedIngredients.length > 1) {
      setExtractedIngredients(extractedIngredients.filter((_, i) => i !== index));
    }
  };

  // 提交表单（创建或更新菜谱）
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("菜谱标题不能为空");
      return;
    }

    setLoading(true);

    const recipeData = {
      title: title.trim(),
      ingredients: ingredients.filter(ing => ing.trim() !== ""),
      instructions: instructions.trim(),
      extractedIngredients: extractedIngredients.filter(ing => ing.trim() !== "")
    };

    try {
      const url = isEditMode && id 
        ? `${API_BASE_URL}/user-recipes/${id}` 
        : `${API_BASE_URL}/user-recipes`;
      
      const method = isEditMode ? axios.put : axios.post;
      
      await method(url, recipeData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      navigate("/my-recipes");
    } catch (err: any) {
      console.error("保存菜谱失败:", err);
      setError(err.response?.data?.message || "保存失败");
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="container">
        <div className="empty-state">
          <h2>🔐 Please Login</h2>
          <p>You need to be logged in to create recipes.</p>
          <button onClick={() => navigate("/login")} className="btn-primary">
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="recipe-form-container">
        <div className="recipe-form-header">
          <h1>{isEditMode ? "✏️ Edit Recipe" : "➕ Create New Recipe"}</h1>
          <p className="subtitle">Share your culinary creation with the world!</p>
        </div>

        <form onSubmit={handleSubmit} className="recipe-form">
          {error && <div className="error-message">{error}</div>}

          {/* Title */}
          <div className="form-section">
            <label htmlFor="title" className="form-label">
              Recipe Title *
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Mom's Famous Chocolate Cake"
              className="form-input"
              required
            />
          </div>

          {/* Ingredients */}
          <div className="form-section">
            <div className="section-header">
              <label className="form-label">Ingredients</label>
              <button type="button" onClick={addIngredient} className="btn-add-item">
                ➕ Add Ingredient
              </button>
            </div>
            <div className="ingredients-list">
              {ingredients.map((ingredient, index) => (
                <div key={index} className="ingredient-item">
                  <input
                    type="text"
                    value={ingredient}
                    onChange={(e) => handleIngredientChange(index, e.target.value)}
                    placeholder="e.g., 2 cups all-purpose flour"
                    className="form-input"
                  />
                  {ingredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="btn-remove-item"
                    >
                      ✖
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Key Ingredients */}
          <div className="form-section">
            <div className="section-header">
              <label className="form-label">Key Ingredients (Tags)</label>
              <button type="button" onClick={addKeyIngredient} className="btn-add-item">
                ➕ Add Tag
              </button>
            </div>
            <small className="form-hint">Main ingredients for filtering (e.g., "Chicken", "Garlic")</small>
            <div className="ingredients-list">
              {extractedIngredients.map((ing, index) => (
                <div key={index} className="ingredient-item">
                  <input
                    type="text"
                    value={ing}
                    onChange={(e) => handleKeyIngredientChange(index, e.target.value)}
                    placeholder="e.g., Chicken"
                    className="form-input"
                  />
                  {extractedIngredients.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeKeyIngredient(index)}
                      className="btn-remove-item"
                    >
                      ✖
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="form-section">
            <label htmlFor="instructions" className="form-label">
              Cooking Instructions
            </label>
            <textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Enter step-by-step instructions (one per line)"
              className="form-textarea"
              rows={10}
            />
            <small className="form-hint">Tip: Write each step on a new line for better formatting</small>
          </div>

          {/* Submit Buttons */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : (isEditMode ? "Update Recipe" : "Create Recipe")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

