import { useState } from 'react'
import Button from '../components/ui/Button'

export default function NotificationsModal({ onClose }) {
    const [settings, setSettings] = useState({
        scanResults: true,
        newsAndUpdates: true,
        dailyBeautyTips: true,
    })

    const toggle = (key) => setSettings(prev => ({ ...prev, [key]: !prev[key] }))

    const NOTIFICATIONS = [
        { key: 'scanResults', label: 'Scan Results', description: 'Alerts when analysis is ready' },
        { key: 'newsAndUpdates', label: 'News and Updates', description: 'New feature announcements' },
        { key: 'dailyBeautyTips', label: 'Daily Beauty Tips', description: 'Curated safety advice' },
    ]

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-bold text-text-title">Notification Settings</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Notification rows */}
                <div className="flex flex-col gap-4 mb-6">
                    {NOTIFICATIONS.map(({ key, label, description }) => (
                        <div key={key} className="flex items-center justify-between bg-[#E7F0EF] rounded-2xl px-4 py-3.5">
                            <div>
                                <p className="text-sm font-bold text-text-title">{label}</p>
                                <p className="text-xs text-text-secondary mt-0.5">{description}</p>
                            </div>
                            {/* Toggle */}
                            <button
                                type="button"
                                onClick={() => toggle(key)}
                                className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors duration-200 ${settings[key] ? 'bg-primary' : 'bg-gray-300'}`}
                            >
                                <span
                                    className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${settings[key] ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </button>
                        </div>
                    ))}
                </div>

                <Button
                    text="Done"
                    variant="primary"
                    onClick={onClose} />
            </div>
        </div>
    )
}