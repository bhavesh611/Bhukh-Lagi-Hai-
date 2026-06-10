import { Routes, Route } from 'react-router-dom'
import Fridge from './pages/Fridge'
import Suggestions from './pages/Suggestions'
import Recipe from './pages/Recipe'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Fridge />} />
      <Route path="/suggestions" element={<Suggestions />} />
      <Route path="/recipe" element={<Recipe />} />
    </Routes>
  )
}
