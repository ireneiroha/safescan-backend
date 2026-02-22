import { useState } from 'react'
import EmptyHistory from '../components/history/EmptyHistory'
import HistoryCard from '../components/history/HistoryCard'

// mock data
const MOCK_HISTORY = [
    { id: 1, productName: 'Luxe Hydra', time: 'Today, 2:45 PM', ingredientCount: 12, safety: 'safe' },
    { id: 2, productName: 'Luxe Hydra', time: 'Today, 2:45 PM', ingredientCount: 12, safety: 'risky' },
    { id: 3, productName: 'Luxe Hydra', time: 'Today, 2:45 PM', ingredientCount: 12, safety: 'safe' },
    { id: 4, productName: 'Luxe Hydra', time: 'Today, 2:45 PM', ingredientCount: 12, safety: 'restricted' },
]

export default function History() {
    const [history, setHistory] = useState(MOCK_HISTORY)
    // const [history, setHistory] = useState([])
    const [loading, setLoading] = useState(false)


    // useEffect(() => {
    //   const fetchHistory = async () => {
    //     setLoading(true)
    //     try {
    //       const token = localStorage.getItem('token')
    //       const res = await fetch('/api/scan-history', {
    //         headers: { Authorization: `Bearer ${token}` }
    //       })
    //       const data = await res.json()
    //       setHistory(data)
    //     } catch (err) {
    //       console.error('Failed to fetch history:', err)
    //     } finally {
    //       setLoading(false)
    //     }
    //   }
    //   fetchHistory()
    // }, [])

    return (
        <div className="mx-auto max-w-md px-4 py-6">

            {/* Header */}
            <h1 className="text-2xl font-bold text-text-title mb-5">Scan History</h1>

            {loading ? (
                <div className="flex justify-center py-20">
                    <svg className="animate-spin h-7 w-7 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                </div>
            ) : history.length === 0 ? (
                <EmptyHistory />
            ) : (
                <>
                    <div className="flex items-center gap-2 text-sm font-medium text-text-secondary mb-4">
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Recently Scanned
                    </div>
                    <div className="flex flex-col gap-3">
                        {history.map((item) => (
                            <HistoryCard key={item.id} {...item} />
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}