import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { fetchFullRecipe } from '../lib/gemini'

export default function Recipe() {
  const location = useLocation()
  const { dish, mealType } = location.state ?? {}
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!dish) return
    fetchFullRecipe(dish, mealType)
      .then(setRecipe)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [dish, mealType])

  if (!dish) {
    return (
      <div className="page">
        <div className="error-box">
          No dish selected. <Link to="/suggestions" style={{ color: 'var(--accent)' }}>Go back</Link>.
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div className="page-header">
        <Link to="/suggestions" className="back-link">← Back to suggestions</Link>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="spinner" />
          <p className="loading-text">Fetching full recipe…</p>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      {recipe && (
        <>
          <h1 className="recipe-title">{recipe.name}</h1>
          <div className="recipe-time">⏱ {recipe.totalTime}</div>

          <div className="divider" />

          <div className="recipe-section-title">Ingredients</div>
          <ul className="ingredients-list">
            {(recipe.ingredients ?? []).map((ing, i) => (
              <li key={i}>{ing}</li>
            ))}
          </ul>

          <div className="recipe-section-title">Method</div>
          <ol className="steps-list">
            {(recipe.steps ?? []).map((step, i) => (
              <li key={i} className="step-item">
                <div className="step-number">{i + 1}</div>
                <div className="step-text">{step}</div>
              </li>
            ))}
          </ol>

          {recipe.tip && (
            <div className="tip-box">
              <strong>💡 Gujarati Tip</strong>
              {recipe.tip}
            </div>
          )}
        </>
      )}
    </div>
  )
}
