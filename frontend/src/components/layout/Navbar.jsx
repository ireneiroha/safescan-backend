export default function Navbar() {
  return (
    <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-4 md:px-6 md:py-5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
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
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <span className="text-lg font-semibold text-gray-800 md:text-xl">
          SafeScan
        </span>
      </div>
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-teal-500/10 hover:text-teal-600 md:h-11 md:w-11"
        aria-label="Open menu"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>
    </nav>
  )
}
