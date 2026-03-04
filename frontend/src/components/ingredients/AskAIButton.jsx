import { useState } from "react"

export default function AskAIButton({ name }) {
    const [loading, setLoading] = useState(false)
    const [aiResult, setAiResult] = useState(null)
    const [error, setError] = useState(null)
    const [open, setOpen] = useState(false)

    const handleAskAI = async () => {
        setLoading(true)
        setError(null)
        setOpen(true)
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [
                        {
                            role: 'user',
                            content: `You are a cosmetic ingredient safety expert. In 2-3 short sentences, explain what the ingredient "${name}" is, what it does in cosmetic products, and whether it is generally considered safe or a concern for skin. Be concise and use simple language a regular consumer would understand. End with a one-word safety label: SAFE, CAUTION, or AVOID.`
                        }
                    ]
                })
            })
            const data = await response.json()
            const text = data.content?.[0]?.text ?? 'Could not get a response.'
            setAiResult(text)
        } catch (err) {
            setError('Failed to get AI response. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="mt-2 pl-4">
            {!open && (
                <button
                    type="button"
                    onClick={handleAskAI}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary border border-primary/30 bg-teal-50 hover:bg-teal-100 transition-colors px-3 py-1.5 rounded-full"
                >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    Ask AI
                </button>
            )}

            {open && (
                <div className="mt-2 rounded-xl bg-gray-50 border border-gray-200 p-3">
                    {loading && (
                        <div className="flex items-center gap-2 text-xs text-text-secondary">
                            <svg className="animate-spin h-3.5 w-3.5 text-primary" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                            Asking AI...
                        </div>
                    )}
                    {error && <p className="text-xs text-danger">{error}</p>}
                    {aiResult && (
                        <>
                            <div className="flex items-center gap-1.5 mb-1.5">
                                <svg className="h-3.5 w-3.5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                </svg>
                                <p className="text-xs font-bold text-primary">AI Analysis</p>
                            </div>
                            <p className="text-xs text-text-body leading-relaxed">{aiResult}</p>
                            <button
                                type="button"
                                onClick={() => { setOpen(false); setAiResult(null) }}
                                className="mt-2 text-xs text-text-secondary hover:text-text-title transition-colors"
                            >
                                Close
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    )
}