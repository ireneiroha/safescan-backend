import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import productOverlay from '../assets/images/product-overlay.svg'
import Badge from '../assets/icons/container.svg?react'
import Stroke from '../assets/icons/stroke.svg?react'
import Mobile from '../assets/icons/mobile.svg?react'
import CameraScanner from './CameraScanner'

export const VerifiedIngredientsBadge = () => {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 w-[217px] md:w-[300px] rounded-2xl border border-white/40 bg-white/80 backdrop-blur-sm px-4 py-3 shadow-md">
      <Badge className="md:h-8 md:w-8" />
      <div className="text-left">
        <p className="text-sm font-bold text-text-title md:text-base">Verified Ingredients</p>
        <p className="text-[10px] text-text-secondary md:text-sm">Clinically tested database</p>
      </div>
    </div>
  )
}

export default function ScanLanding() {
  const fileInputRef = useRef(null)
  const [showCamera, setShowCamera] = useState(false)
  const [scanning, setScanning] = useState(false)
  const navigate = useNavigate()

  const handleImageReady = async (imageData) => {
    const token = localStorage.getItem('token')
    if (!token) {
      navigate('/login')
      return
    }

    setScanning(true)
    try {
      const fetchRes = await fetch(imageData)
      const blob = await fetchRes.blob()
      const formData = new FormData()
      formData.append('image', blob, 'scan.jpg')

      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()

      if (res.status === 401) {
        localStorage.removeItem('token')
        navigate('/login')
        return
      }

      if (!res.ok) {
        alert(data.error || 'Failed to scan image. Please try again.')
        return
      }

      navigate('/confirm', { state: { imageData, extractedText: data.extractedText } })
    } catch (err) {
      alert('Failed to scan image. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => handleImageReady(reader.result)
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleCameraCapture = (imageData) => {
    setShowCamera(false)
    handleImageReady(imageData)
  }

  if (scanning) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-border shadow-sm flex flex-col items-center justify-center px-8 py-16 text-center">
          <div className="relative h-16 w-16 mb-6">
            <svg className="animate-spin h-16 w-16" viewBox="0 0 64 64" fill="none">
              <circle cx="32" cy="32" r="26" stroke="#E0EFEE" strokeWidth="6" />
              <path d="M32 6 a26 26 0 0 1 26 26" stroke="url(#scanGrad)" strokeWidth="6" strokeLinecap="round" />
              <defs>
                <linearGradient id="scanGrad" x1="32" y1="6" x2="58" y2="32" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0D645D" />
                  <stop offset="100%" stopColor="#A8D5D2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-text-title mb-2">Reading label...</h2>
          <p className="text-sm text-text-secondary">Extracting ingredients from your image.</p>
        </div>
      </div>
    )
  }

  if (showCamera) {
    return (
      <CameraScanner
        onCapture={handleCameraCapture}
        onClose={() => setShowCamera(false)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-10">
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      <div className="flex flex-col md:flex-row md:items-center md:gap-16 md:min-h-[calc(100vh-72px)] py-8 md:py-0">

        <div className="flex-1 md:max-w-[520px]">

          {/* Mobile image */}
          <div className="md:hidden mb-6">
            <div className="relative mx-auto overflow-hidden rounded-[30px] shadow-xl/20">
              <div className="relative">
                <img src={productOverlay} alt="Product overlay" className="w-[381px] h-[281px] object-cover shadow-xl bg-gray-100/50" />
                <VerifiedIngredientsBadge />
              </div>
            </div>
          </div>

          <h1 className="text-[32px] font-bold text-text-title md:text-5xl md:leading-tight">
            Scan your{' '}<span className="text-primary">Products</span>{' '}for safety.
          </h1>
          <p className="mt-3 text-base text-text-body md:text-lg md:mt-8">
            Identify toxic ingredients instantly. Set your health profile and let our AI do the clinical analysis for you.
          </p>

          <div className="mt-6 md:mt-8">
            <label htmlFor="product-type" className="block text-base font-bold text-text-title">
              Product type (optional)
            </label>
            <div className="relative mt-2">
              <select id="product-type" className="w-full appearance-none rounded-xl border border-[#909090] py-3 pl-4 pr-10 text-gray-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 md:py-3.5">
                <option value="">Select product category</option>
                <option value="skincare">Skincare</option>
                <option value="haircare">Haircare</option>
                <option value="makeup">Makeup</option>
                <option value="bodycare">Body Care</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setShowCamera(true)}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-bold text-white transition-colors hover:bg-teal-700 md:py-4"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Scan Label
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3.5 font-bold text-primary transition-colors hover:bg-teal-50 md:py-4"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Image
            </button>
          </div>

          <div className="grid grid-cols-2 mt-8 -mx-2">
            <div className="flex items-center gap-3 px-2 py-4">
              <Stroke className="w-7 h-7 shrink-0" />
              <div>
                <p className="font-bold text-text-title text-sm">Instant Analysis</p>
                <p className="text-xs text-text-secondary mt-0.5">Results in seconds</p>
              </div>
            </div>
            <div className="flex items-center gap-3 px-2 py-4 border-l border-gray-200">
              <Mobile className="w-7 h-7 shrink-0" />
              <div>
                <p className="font-bold text-text-title text-sm">Mobile Optimized</p>
                <p className="text-xs text-text-secondary mt-0.5">Scan on the go</p>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop right image */}
        <div className="hidden md:flex flex-1 items-center justify-center">
          <div className="relative w-full max-w-[520px]">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img src={productOverlay} alt="Product overlay" className="w-full h-[560px] object-cover bg-gray-100/50" />
              <VerifiedIngredientsBadge />
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}