import { Routes, Route } from 'react-router-dom'
import './themes/variables.css'
import './styles/global.css'
import './index.css'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'

function App() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <Navbar />

      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/login" element={<SignIn />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
