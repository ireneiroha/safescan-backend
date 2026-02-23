import { useRef, useState } from 'react'
import productOverlay from '../../assets/product-overlay.svg'
import Badge from '../assets/icons/container.svg?react'
import Stroke from '../assets/icons/stroke.svg?react'
import Mobile from '../assets/icons/mobile.svg?react'

export const VerifiedIngredientsBadge = () => {
  return (
    <div className="absolute left-1/3 bottom-1/6 flex -translate-x-1/2 translate-y-1/2 items-center gap-3 w-[217px] h-[48px] rounded-2xl border border-white/40 bg-white/80 backdrop-blur-sm px-4 py-2 shadow-md md:px-5 md:py-3.5">
      <Badge />
      <div className="text-left">
        <p className="text-sm font-bold text-text-title md:text-lg">
          Verified Ingredients
        </p>
        <p className="text-[10px] text-text-secondary">
          Clinically tested database
        </p>
      </div>
    </div>
  )
}

const MOCK_INGREDIENTS = [
  { name: 'Aqua', safety: 'safe' },
  { name: 'Glycerin', safety: 'safe' },
  { name: 'Cetearyl Alcohol', safety: 'safe' },
  { name: 'Dimethicone', safety: 'caution' },
  { name: 'Phenoxyethanol', safety: 'caution' },
]

export default function ScanLanding() {
  const fileInputRef = useRef(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [scanStatus, setScanStatus] = useState('idle') // 'idle' | 'scanning' | 'done'
  const [scanResults, setScanResults] = useState(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = () => {
      setImagePreview(reader.result)
      setScanStatus('scanning')
      setScanResults(null)
      // Simulate scan duration, then show results
      setTimeout(() => {
        setScanResults({
          ingredients: MOCK_INGREDIENTS,
          productType: 'Skincare',
          summary: '5 ingredients detected. No high-risk ingredients found.',
        })
        setScanStatus('done')
      }, 3500)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleReset = () => {
    setImagePreview(null)
    setScanStatus('idle')
    setScanResults(null)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 md:px-6 md:py-12">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Upload image"
      />

      <div className="md:px-10 md:py-10">
        <div className="relative mx-auto overflow-hidden rounded-[30px] shadow-xl/20">
          <img
            src={productOverlay}
            alt="Product overlay"
            className="w-[381px] h-[281px] object-cover shadow-xl bg-gray-100/50"
            style={{ background: 'rgba(243,244,246,0.5) no-repeat' }}
          />
          <VerifiedIngredientsBadge />
        </div>
      </div>

      <div className="w-full overflow-hidden rounded-[20px]">
        {/* Top section: large image placeholder with checkered pattern */}
        <div>
          {imagePreview && (
            <>
              <img
                src={imagePreview}
                alt="Product scan"
                className="block w-full object-contain"
                style={{ maxHeight: '220px' }}
              />
              {scanStatus === 'scanning' && (
                <>
                  <div className="absolute inset-0 bg-teal-500/10 mix-blend-multiply" />
                  <div
                    className="absolute left-0 right-0 h-1 bg-teal-500 shadow-lg"
                    style={{
                      animation: 'scan-line 1.8s ease-in-out infinite',
                    }}
                  />
                  <p className="absolute bottom-2 left-0 right-0 text-center text-sm font-medium text-teal-700">
                    Scanning...
                  </p>
                </>
              )}
              {scanStatus === 'done' && scanResults && (
                <div className="mt-4 w-full max-w-[280px] text-left md:max-w-[320px]">
                  <p className="text-sm font-medium text-gray-800">
                    {scanResults.productType} · {scanResults.summary}
                  </p>
                  <ul className="mt-2 space-y-1 rounded-lg border border-gray-200 bg-white/90 p-3 shadow-sm">
                    {scanResults.ingredients.map((ing) => (
                      <li
                        key={ing.name}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-800">{ing.name}</span>
                        <span
                          className={
                            ing.safety === 'safe'
                              ? 'text-teal-600'
                              : 'text-amber-600'
                          }
                        >
                          {ing.safety === 'safe' ? '✓ Safe' : '⚠ Caution'}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-3 text-sm font-medium text-teal-600 hover:underline"
                  >
                    Scan another image
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Main content */}
        <div className="px-2 py-8 md:px-10 md:py-10">
          <h1 className="text-[32px] font-bold text-text-title md:text-3xl">
            Scan your{' '}
            <span className="text-primary">Products</span>{' '}
            for safety.
          </h1>
          <p className="mt-3 text-lg text-text-body md:text-base">
            Identify toxic ingredients instantly. Set your health profile and let
            our AI do the clinical analysis for you.
          </p>

          <div className="mt-6">
            <label
              htmlFor="product-type"
              className="block text-base font-bold text-text-title"
            >
              Product type (optional)
            </label>
            <div className="relative mt-2">
              <select
                id="product-type"
                className="w-full appearance-none rounded-xl border-[1px] border-[#909090] py-3 pl-4 pr-10 text-gray-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 md:py-3.5"
              >
                <option value="">Select product category</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-gray-400">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3.5 font-bold text-bg-input transition-colors hover:bg-teal-700 md:py-4"
            >
              <svg
                className="h-5 w-5 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 13v7a2 2 0 01-2 2H7a2 2 0 01-2-2v-7"
                />
              </svg>
              Open Camera
            </button>
            <button
              type="button"
              onClick={handleUploadClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3.5 font-bold text-primary transition-colors hover:bg-teal-50 md:py-4"
            >
              <svg
                className="h-5 w-5 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Upload Image
            </button>
          </div>

          {/* Feature callouts */}
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
      </div>
    </div>
  )
}
