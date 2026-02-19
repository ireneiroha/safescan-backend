import './index.css'
import Navbar from './components/layout/Navbar'
import Home from './pages/Home'

function App() {
  return (
    <div className="min-h-screen bg-[#EDF7F7]">
      <Navbar />
      <main>
        <Home />
      </main>
    </div>
  )
}

export default App
