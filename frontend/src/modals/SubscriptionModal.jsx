import Button from "../components/ui/Button"

export default function SubscriptionModal({ onClose }) {
    const FEATURES = [
        'Unlimited Label Scans',
        'Clinical Study Access',
        'Routine Compatibility Checker',
        'Ad-Free Experience',
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white rounded-3xl overflow-hidden shadow-2xl">
                {/* Top teal section */}
                <div className="bg-primary px-6 pt-8 pb-10 flex flex-col items-center text-center">
                    <span className="bg-white/20 text-white text-xs font-bold tracking-widest px-4 py-1.5 rounded-full mb-5">
                        SAFESCAN PRO
                    </span>
                    <h2 className="text-3xl font-black text-white mb-3">Unlimited Safety</h2>
                    <p className="text-sm text-white/70 leading-relaxed">
                        Get detailed clinical data and ingredient compatibility for every scan.
                    </p>
                </div>

                {/* White bottom section */}
                <div className="px-6 pt-6 pb-6">
                    {/* Features list */}
                    <div className="flex flex-col gap-3 mb-6">
                        {FEATURES.map((feature) => (
                            <div key={feature} className="flex items-center gap-3">
                                <svg className="h-5 w-5 text-primary shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                                <p className="text-sm text-text-title font-medium">{feature}</p>
                            </div>
                        ))}
                    </div>

                    <Button
                        text="Manage Billing"
                        variant="primary"
                        className="mb-3" />

                    <Button
                        text="Close"
                        variant="outline"
                        onClick={onClose} />
                </div>
            </div>
        </div>
    )
}