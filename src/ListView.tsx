/**
 */
import { useRecipeData, Recipe } from "./RecipeDataContext";
import { useEffect, useState, useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Pagination from "./pageselector";
import { getImageUrl, PLACEHOLDER_IMAGE } from "./config/imageConfig";
import "./index.css";

const limit = 48;

function SkeletonCard() {
  return <div className="skeleton-card" />;
}

export default function ListView() {
  const { fetchAllRecipes, allRecipes, searchRecipes } = useRecipeData();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(Number(searchParams.get("page")) || 0);
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [searchMode, setSearchMode] = useState<"title" | "ingredient">(
    (searchParams.get("mode") as "title" | "ingredient") || "title"
  );
  const [sortMode, setSortMode] = useState<"id" | "title">(
    (searchParams.get("sort") as "id" | "title") || "id"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">(
    (searchParams.get("order") as "asc" | "desc") || "asc"
  );

  useEffect(() => {
    fetchAllRecipes().finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (page > 0) params.page = String(page);
    if (searchMode !== "title") params.mode = searchMode;
    if (sortMode !== "id") params.sort = sortMode;
    if (sortOrder !== "asc") params.order = sortOrder;
    setSearchParams(params, { replace: true }); 
  }, [search, page, searchMode, sortMode, sortOrder, setSearchParams]);

  const filtered = useMemo(() => {
    return search ? searchRecipes(search, searchMode) : allRecipes;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, searchMode, allRecipes]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (sortMode === "id") {
        const result = a.id - b.id;
        return sortOrder === "asc" ? result : -result;
      } else {
        const titleA = (a.title || "").trim().toLowerCase();
        const titleB = (b.title || "").trim().toLowerCase();
        const result = titleA.localeCompare(titleB, undefined, { 
          sensitivity: "base",
          numeric: true 
        });
        return sortOrder === "asc" ? result : -result;
      }
    });
  }, [filtered, sortMode, sortOrder]);

  const paginated = useMemo(() => {
    return sorted.slice(page * limit, (page + 1) * limit);
  }, [sorted, page]);

  return (
    <div className="list-container">
      <h2 className="page-title">🔍 Find Your Perfect Recipe</h2>
      <div className="list-header">
        <div className="search-bar">
          <input
            type="text"
            placeholder={`Search by ${searchMode === "title" ? "Title" : "Ingredient"}...`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="search-input"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSearchMode("title");
              setPage(0);
            }}
            className={`btn ${searchMode === "title" ? "active" : ""}`}
          >
            📝 Title
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSearchMode("ingredient");
              setPage(0);
            }}
            className={`btn ${searchMode === "ingredient" ? "active" : ""}`}
          >
            🥗 Ingredient
          </button>
        </div>

        <div className="sort-bar">
          <span className="sort-label">Sort by:</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSortMode("id");
              setPage(0);
            }}
            className={`btn ${sortMode === "id" ? "active" : ""}`}
          >
            ID
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSortMode("title");
              setPage(0);
            }}
            className={`btn ${sortMode === "title" ? "active" : ""}`}
          >
            Title
          </button>

          <span className="order-label">Order:</span>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSortOrder("asc");
              setPage(0);
            }}
            className={`btn ${sortOrder === "asc" ? "active" : ""}`}
          >
            ↑ Asc
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setSortOrder("desc");
              setPage(0);
            }}
            className={`btn ${sortOrder === "desc" ? "active" : ""}`}
          >
            ↓ Desc
          </button>
        </div>
      </div>

      <div className="pokemon-grid">
        {loading ? (
          Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)
        ) : paginated.length > 0 ? (
          paginated.map((recipe) => {
            const imgUrl = getImageUrl(recipe.imageName);

            return (
              <Link to={`/recipe/${recipe._id}`} key={recipe._id} className="pokemon-card">
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
                    <>
                      {recipe.extractedIngredients.filter(ing => ing && typeof ing === 'string').slice(0, 3).map((ing, idx) => (
                        <span key={idx} className="ingredient-tag">
                          {ing}
                        </span>
                      ))}
                      {recipe.extractedIngredients.filter(ing => ing && typeof ing === 'string').length > 3 && (
                        <span className="ingredient-tag">
                          +{recipe.extractedIngredients.filter(ing => ing && typeof ing === 'string').length - 3}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="ingredient-tag" style={{ background: '#999' }}>No ingredients</span>
                  )}
                </div>
              </Link>
            );
          })
        ) : (
          <p className="no-results">No recipes found. Try a different search!</p>
        )}
      </div>

      <Pagination
        page={page}
        total={sorted.length}
        limit={limit}
        onPageChange={(newPage) => {
          setPage(newPage);
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />
    </div>
  );
}