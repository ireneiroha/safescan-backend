import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import './themes/variables.css'
import './styles/global.css'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import SignUp from './pages/SignUp'
import SignIn from './pages/SignIn'
import Navbar from './components/layout/Navbar'
import ScrollToTop from './utils/ScrollToTop'
import Lookup from './pages/Lookup'
// import PrivateRoute from './utils/PrivateRoute'
import History from './pages/History'
import Results from './pages/Results'
import Settings from './pages/Settings'
import ScanLanding from './pages/ScanLanding'
import Landing from './pages/Landing'
import PrivacyPolicy from './pages/PrivacyPolicy'
import ConfirmIngredients from './components/camera/ConfirmIngredients'
import Analyzing from './components/camera/Analyzing'

const AUTH_PAGES = ['/register', '/login', '/scan-result']

function AppLayout() {
  const { pathname } = useLocation()
  const hideNavbar = AUTH_PAGES.some(path => pathname.startsWith(path))

  return (
    <div className="min-h-screen bg-bg-primary">
      <ScrollToTop />
      {!hideNavbar && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/register" element={<SignUp />} />
          <Route path="/login" element={<SignIn />} />
          <Route path="/scan-home" element={<ScanLanding />} />
          <Route path="/lookup" element={<Lookup />} />
          {/* <Route path='/history' element={
            <PrivateRoute>
              <History />
            </PrivateRoute>
          } /> */}
          <Route path='/history' element={<History />} />
          <Route path='/scan-result/:id' element={<Results />} />
          {/* <Route path="/settings" element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          } /> */}
          <Route path='/settings' element={<Settings />} />
          <Route path='/privacy' element={<PrivacyPolicy />} />
          <Route path='/confirm' element={<ConfirmIngredients />} />
          <Route path='/analyzing' element={<Analyzing />} />
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppLayout />
    </AuthProvider>
  )
}

export default App