const API_KEY = import.meta.env.VITE_GEMINI_API_KEY
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`

const GUJARATI_SPICES =
  'mustard seeds, cumin, turmeric, hing (asafoetida), curry leaves, red chilli, coriander powder, garam masala, sesame seeds, fenugreek seeds, carom seeds (ajwain)'

function buildPrompt(ingredients, mealType) {
  const ingredientList = ingredients.join(', ')

  if (mealType === 'lunch') {
    return `Suggest exactly 3 quick Indian lunch recipes (Gujarati style) that can be made in 15–20 minutes using a pressure cooker or served with roti/thepla. Use these available ingredients: ${ingredientList}. Assume standard Gujarati spices are available: ${GUJARATI_SPICES}. Return ONLY a valid JSON array (no markdown, no explanation) with exactly 3 objects, each having these fields: name (string), time (string like "15 mins"), keyIngredients (array of strings, max 4), mealType (string "lunch"). Example format: [{"name":"...","time":"...","keyIngredients":["..."],"mealType":"lunch"}]`
  }

  return `Suggest exactly 3 healthy Indian dinner recipes (Gujarati style) — rice-based dishes like khichdi, dal-rice, or pulao, with flexible cooking time. Use these available ingredients: ${ingredientList}. Assume standard Gujarati spices are available: ${GUJARATI_SPICES}. Return ONLY a valid JSON array (no markdown, no explanation) with exactly 3 objects, each having these fields: name (string), time (string like "30 mins"), keyIngredients (array of strings, max 4), mealType (string "dinner"). Example format: [{"name":"...","time":"...","keyIngredients":["..."],"mealType":"dinner"}]`
}

function buildRecipePrompt(dishName, mealType) {
  return `Give me the full recipe for "${dishName}" (${mealType}, Gujarati style). Include authentic Gujarati tempering with mustard seeds, curry leaves, turmeric, hing, etc. Return ONLY a valid JSON object (no markdown, no explanation) with these fields: name (string), totalTime (string), ingredients (array of strings with quantities), steps (array of strings, each a complete step), tip (string, one Gujarati cooking tip). Example: {"name":"...","totalTime":"...","ingredients":["..."],"steps":["..."],"tip":"..."}`
}

async function callGemini(prompt) {
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini API error ${res.status}: ${err}`)
  }

  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

  // Strip markdown code fences if present
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

export async function fetchSuggestions(ingredients) {
  const [lunch, dinner] = await Promise.all([
    callGemini(buildPrompt(ingredients, 'lunch')),
    callGemini(buildPrompt(ingredients, 'dinner')),
  ])
  return { lunch, dinner }
}

export async function fetchFullRecipe(dishName, mealType) {
  return callGemini(buildRecipePrompt(dishName, mealType))
}
