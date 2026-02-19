import { useRef, useState } from 'react'
import productOverlay from '../../assets/product-overlay.svg'

export const VerifiedIngredientsBadge = () => {
  return (
    <div className="absolute left-1/2 bottom-1/3 flex -translate-x-1/2 translate-y-1/2 items-center gap-3 rounded-2xl border border-gray-100 bg-white px-4 py-3 shadow-md md:px-5 md:py-3.5">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-teal-500 md:h-11 md:w-11">
        <div className="h-5 w-5 rounded-full border-2 border-teal-500 md:h-6 md:w-6" />
      </div>
      <div className="text-left">
        <p className="text-base font-bold text-gray-800 md:text-lg">
          Verified Ingredients
        </p>
        <p className="text-sm text-gray-500">
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

export default function Home() {
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
    <div className="mx-auto flex max-w-3xl flex-col items-center px-4 py-8 md:px-6 md:py-12">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
        aria-label="Upload image"
      />

      <div className="py-8 md:px-10 md:py-10">
        <div className="relative mx-auto h-[440px] overflow-hidden rounded-[56px] shadow-md bg-gray-100/50">
          <img
            src={productOverlay}
            alt="Product overlay"
            className="w-full object-cover"
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
        <div className="px-[30px] py-8 md:px-10 md:py-10">
          <div className="mb-4 flex md:mb-5">
            <div className="inline-flex items-center gap-2.5 rounded-lg py-1.5 text-sm font-medium text-teal-600">
              <svg
                className="h-4 w-4"
                fill="currentColor"
                viewBox="0 0 20 20"
                aria-hidden
              >
                <path
                  fillRule="evenodd"
                  d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                  clipRule="evenodd"
                />
              </svg>
              New: AI Ingredient Detection
            </div>
          </div>
          <h1 className="text-2xl font-semibold text-gray-800 md:text-3xl">
            Scan your{' '}
            <span className="font-bold text-teal-600">Products</span>{' '}
            for safety.
          </h1>
          <p className="mt-3 text-gray-600 md:text-base">
            Identify toxic ingredients instantly. Set your health profile and let
            our AI do the clinical analysis for you.
          </p>

          <div className="mt-6">
            <label
              htmlFor="product-type"
              className="block text-sm font-medium text-gray-800"
            >
              Product type (optional)
            </label>
            <div className="relative mt-2">
              <select
                id="product-type"
                className="w-full appearance-none rounded-xl border border-gray-200 bg-white py-3 pl-4 pr-10 text-gray-700 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 md:py-3.5"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0D645D] px-4 py-3.5 font-medium text-white transition-colors hover:bg-teal-600 md:py-4"
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
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3.5 font-medium text-gray-700 transition-colors hover:bg-gray-50 md:py-4"
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
          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
                <svg
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden
                >
                  <path
                    fillRule="evenodd"
                    d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Instant Analysis</p>
                <p className="mt-0.5 text-sm text-gray-500">Results in seconds</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-600">
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
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div>
                <p className="font-medium text-gray-800">Mobile Optimized</p>
                <p className="mt-0.5 text-sm text-gray-500">Scan on the go</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
