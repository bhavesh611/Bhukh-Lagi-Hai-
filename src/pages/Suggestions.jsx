import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'

function RecipeCarousel({ recipes, mealType }) {
  const [index, setIndex] = useState(0)
  const navigate = useNavigate()
  const recipe = recipes[index]

  const icon = mealType === 'lunch' ? '☀️' : '🌙'

  return (
    <div className="recipe-carousel">
      <div className="section-heading">
        {icon} {mealType === 'lunch' ? 'Lunch' : 'Dinner'}
      </div>

      <div className="recipe-card card-enter" key={index}>
        <div className="recipe-card-name">{recipe.name}</div>
        <div className="recipe-card-meta">
          <span>⏱ {recipe.time}</span>
          <span style={{ textTransform: 'capitalize' }}>{recipe.mealType}</span>
        </div>
        <div className="key-ingredients">
          {(recipe.keyIngredients ?? []).map((ing) => (
            <span className="ingredient-tag" key={ing}>{ing}</span>
          ))}
        </div>
        <div className="card-footer">
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate('/recipe', { state: { dish: recipe.name, mealType } })}
          >
            Get full recipe →
          </button>
        </div>
      </div>

      <div className="carousel-nav">
        <button
          className="nav-arrow"
          onClick={() => setIndex((i) => Math.max(0, i - 1))}
          disabled={index === 0}
          aria-label="Previous"
        >
          ‹
        </button>
        <div className="dot-indicators">
          {recipes.map((_, i) => (
            <div
              key={i}
              className={`dot ${i === index ? 'active' : ''}`}
              onClick={() => setIndex(i)}
              style={{ cursor: 'pointer' }}
            />
          ))}
        </div>
        <button
          className="nav-arrow"
          onClick={() => setIndex((i) => Math.min(recipes.length - 1, i + 1))}
          disabled={index === recipes.length - 1}
          aria-label="Next"
        >
          ›
        </button>
      </div>
    </div>
  )
}

export default function Suggestions() {
  const location = useLocation()
  const suggestions = location.state?.suggestions

  if (!suggestions) {
    return (
      <div className="page">
        <div className="error-box">
          No suggestions found. <Link to="/" style={{ color: 'var(--accent)' }}>Go back</Link> and try again.
        </div>
      </div>
    )
  }

  const { lunch = [], dinner = [] } = suggestions

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/" className="back-link">← Back to fridge</Link>
      </div>

      <div style={{ marginBottom: 28 }}>
        <div className="logo">Today's <span>Ideas</span></div>
        <div className="subtitle">Swipe through suggestions for each meal</div>
      </div>

      {lunch.length > 0 && <RecipeCarousel recipes={lunch} mealType="lunch" />}
      {dinner.length > 0 && <RecipeCarousel recipes={dinner} mealType="dinner" />}

      {lunch.length === 0 && dinner.length === 0 && (
        <div className="empty-state">No suggestions returned. Try again with more ingredients.</div>
      )}
    </div>
  )
}
