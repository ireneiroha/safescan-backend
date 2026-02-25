import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function ConfirmIngredients() {
    const navigate = useNavigate()
    const location = useLocation()
    const extractedText = location.state?.extractedText ?? ''
    const imageData = location.state?.imageData ?? null

    const [ingredients, setIngredients] = useState(extractedText)

    const handleRescan = () => {
        navigate('/scan-home')
    }

    const handleContinue = () => {
        if (!ingredients.trim()) return
        navigate('/analyzing', { state: { ingredients, imageData } })
    }

    return (
        <div className="mx-auto max-w-md md:max-w-[1440px] px-4 py-8 md:px-10 md:py-12">
            <div className="md:max-w-2xl md:mx-auto">

                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-text-title">Confirm Ingredients</h1>
                    <p className="text-sm text-text-secondary mt-1">Review and edit the extracted text if needed</p>
                </div>

                <div className="mb-2">
                    <label className="block text-sm font-bold text-text-title mb-2">
                        Ingredient List
                    </label>
                    <textarea
                        value={ingredients}
                        onChange={(e) => setIngredients(e.target.value)}
                        placeholder="Enter or edit ingredients..."
                        rows={10}
                        className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text-body placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                    />
                    <p className="text-xs text-text-secondary mt-1.5">Separate ingredients with commas</p>
                </div>

                <button
                    type="button"
                    onClick={handleRescan}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary px-4 py-3.5 font-bold text-primary hover:bg-teal-50 transition-colors mt-4"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Re-scan
                </button>

                <div className="mt-auto pt-8">
                    <button
                        type="button"
                        onClick={handleContinue}
                        disabled={!ingredients.trim()}
                        className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-4 font-bold text-white hover:bg-teal-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Continue Analysis
                    </button>
                </div>

            </div>
        </div>
    )
}