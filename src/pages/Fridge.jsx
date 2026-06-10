import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadIngredients, saveIngredients } from '../lib/firebase'
import { fetchSuggestions } from '../lib/gemini'

export default function Fridge() {
  const [ingredients, setIngredients] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [suggesting, setSuggesting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const saveTimer = useRef(null)

  useEffect(() => {
    loadIngredients()
      .then(setIngredients)
      .catch(() => setError('Could not load from Firestore. Check Firebase config.'))
      .finally(() => setLoading(false))
  }, [])

  function persistIngredients(updated) {
    setIngredients(updated)
    clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => saveIngredients(updated), 600)
  }

  function handleAdd() {
    const parts = input
      .split(',')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)
    if (!parts.length) return
    const merged = [...new Set([...ingredients, ...parts.map((p) =>
      p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()
    )])]
    persistIngredients(merged)
    setInput('')
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleAdd()
    }
  }

  function removeIngredient(item) {
    persistIngredients(ingredients.filter((i) => i !== item))
  }

  function resetAll() {
    persistIngredients([])
  }

  async function handleSuggest() {
    if (ingredients.length === 0) return
    setSuggesting(true)
    setError('')
    try {
      const suggestions = await fetchSuggestions(ingredients)
      navigate('/suggestions', { state: { suggestions } })
    } catch (err) {
      setError(`Failed to get suggestions: ${err.message}`)
      setSuggesting(false)
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="loading-state">
          <div className="spinner" />
          <p className="loading-text">Loading your fridge…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div>
        <div className="logo">🧊 Fridge <span>Chef</span></div>
        <div className="subtitle">What's in your fridge today?</div>
      </div>

      <div style={{ marginTop: 28 }}>
        <div className="add-row">
          <textarea
            placeholder="tomatoes, paneer, spinach, potato…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button className="btn btn-ghost" onClick={handleAdd}>Add</button>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
          Separate multiple items with commas, or press Enter to add
        </p>
      </div>

      {error && <div className="error-box">{error}</div>}

      {ingredients.length > 0 && (
        <div className="chips-section">
          <div className="chips-label">In your fridge ({ingredients.length})</div>
          <div className="chips">
            {ingredients.map((item) => (
              <span className="chip" key={item}>
                {item}
                <button
                  className="chip-remove"
                  onClick={() => removeIngredient(item)}
                  aria-label={`Remove ${item}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
          <div className="chips-actions">
            <button className="btn btn-danger btn-sm" onClick={resetAll}>
              Reset all
            </button>
          </div>
        </div>
      )}

      {ingredients.length === 0 && !loading && (
        <div className="empty-state" style={{ marginTop: 24 }}>
          Add some ingredients above to get started 🥕
        </div>
      )}

      <div className="bottom-cta">
        <button
          className="btn btn-primary"
          onClick={handleSuggest}
          disabled={ingredients.length === 0 || suggesting}
        >
          {suggesting ? (
            <>
              <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
              Asking Gemini…
            </>
          ) : (
            '✨ Suggest recipes'
          )}
        </button>
      </div>
    </div>
  )
}
