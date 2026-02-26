import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

export default function Analyzing() {
    const navigate = useNavigate()
    const location = useLocation()
    const ingredients = location.state?.ingredients ?? ''
    const imageData = location.state?.imageData ?? null

    useEffect(() => {
        const analyze = async () => {
            try {
                const res = await fetch('/api/scan/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify({ text: ingredients })
                })
                if (res.status === 401) {
                    localStorage.removeItem('token')
                    navigate('/login', { replace: true })
                    return
                }
                const data = await res.json()
                navigate('/scan-result/result', { state: { result: data, imageData }, replace: true })
            } catch (err) {
                console.error('Analysis failed:', err)
                navigate('/scan-home')
            }
        }
        analyze()
    }, [ingredients, navigate])

    return (
        <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4">
            <div className="w-full max-w-md bg-white rounded-3xl border border-border shadow-sm flex flex-col items-center justify-center px-8 py-16 text-center">

                <div className="relative h-16 w-16 mb-6">
                    <svg
                        className="animate-spin h-16 w-16"
                        viewBox="0 0 64 64"
                        fill="none"
                    >
                        <circle
                            cx="32"
                            cy="32"
                            r="26"
                            stroke="#E0EFEE"
                            strokeWidth="6"
                        />
                        <path
                            d="M32 6 a26 26 0 0 1 26 26"
                            stroke="url(#spinnerGrad)"
                            strokeWidth="6"
                            strokeLinecap="round"
                        />
                        <defs>
                            <linearGradient id="spinnerGrad" x1="32" y1="6" x2="58" y2="32" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#0D645D" />
                                <stop offset="100%" stopColor="#A8D5D2" />
                            </linearGradient>
                        </defs>
                    </svg>
                </div>

                <h2 className="text-xl font-bold text-text-title mb-2">Analyzing ingredients...</h2>
                <p className="text-sm text-text-secondary">This may take a few seconds.</p>

            </div>
        </div>
    )
}