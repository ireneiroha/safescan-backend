import { useNavigate } from 'react-router-dom'

export default function EmptyHistory() {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-bg-secondary mb-4">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <p className="text-base font-semibold text-text-title mb-1">No scan history yet</p>
            <p className="text-sm text-text-secondary max-w-[220px] mb-5">
                Scans you perform will appear here so you can review them later.
            </p>
            <button
                type="button"
                onClick={() => navigate('/scan-home')}
                className="rounded-xl bg-primary px-5 py-4 text-xs uppercase font-bold text-white hover:bg-teal-700 transition-colors"
            >
                Scan a product
            </button>
        </div>
    )
}