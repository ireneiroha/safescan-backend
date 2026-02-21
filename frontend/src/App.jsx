import { Routes, Route, Navigate } from 'react-router-dom'
import './themes/variables.css'
import './styles/global.css'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'
import ScrollToTop from './utils/ScrollToTop'
import PrivateRoute from './utils/PrivateRoute'

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-bg-primary">
        <ScrollToTop />
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Navigate to="/register" replace />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/login" element={<SignIn />} />
            <Route path="/home" element={
              <PrivateRoute allowGuest>
                <Home />
              </PrivateRoute>
            } />
          </Routes>
        </main>
      </div>
    </AuthProvider>
  )
}

export default App