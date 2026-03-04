export default function ExitConfirmModal({ onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl">
                <div className="flex justify-end mb-2">
                    <button type="button" onClick={onCancel} className="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <h2 className="text-lg font-bold text-text-title text-center mb-5">Do you want to end Scan?</h2>
                <div className="flex items-center justify-center gap-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-text-title hover:bg-gray-50 transition-colors"
                    >
                        <svg className="h-4 w-4 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        No
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-text-title hover:bg-gray-50 transition-colors"
                    >
                        <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Yes
                    </button>
                </div>
            </div>
        </div>
    )
}