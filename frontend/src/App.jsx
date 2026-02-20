import { Routes, Route } from 'react-router-dom'
import './themes/variables.css'
import './styles/global.css'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'

function App() {
  return (
    <Routes>
      <Route path="/register" element={<SignUp />} />
      <Route path="/login" element={<SignIn />} />
    </Routes>
  )
}

export default App
