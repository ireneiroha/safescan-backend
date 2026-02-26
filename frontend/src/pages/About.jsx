import { useNavigate } from 'react-router-dom'
import ShieldIcon from '../assets/icons/shield.svg?react'
import FlashIcon from '../assets/icons/flash.svg?react'
import GlobeIcon from '../assets/icons/global.svg?react'
import SafeScanLogo from '../assets/logo/safescan-logo.png'

const FEATURES = [
    {
        icon: <ShieldIcon />,
        title: 'Science-Backed Safety',
        description: 'Every ingredient is cross-referenced against clinical databases and peer-reviewed studies.',
    },
    {
        icon: <FlashIcon />,
        title: 'Instant AI Scanning',
        description: 'Our OCR engine reads ingredient labels in seconds — no typing required.',
    },
    {
        icon: <GlobeIcon />,
        title: 'Built for Africa',
        description: 'Designed for consumers across African markets with localised product coverage.',
    },
]

export default function About() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-bg-primary">
            <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">

                {/* Back button */}
                <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-1.5 text-sm font-medium text-text-title hover:text-primary transition-colors mb-8"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* Logo + version */}
                <div className="flex flex-col items-center text-center mb-10">
                    <img src={SafeScanLogo} alt="SafeScan" className="h-10 mb-4" />
                    <span className="inline-flex items-center gap-1.5 bg-[#E7F0EF] rounded-full px-4 py-1.5 text-sm font-semibold text-primary mb-4">
                        Version 1.0.4
                    </span>
                    <h1 className="text-3xl font-bold text-text-title mb-2">About SafeScan</h1>
                    <p className="text-sm text-text-body leading-relaxed max-w-md">
                        SafeScan helps you make informed choices about the beauty and health products you use every day — powered by AI and clinical science.
                    </p>
                </div>

                {/* Mission card */}
                <div className="bg-[#052A27] rounded-3xl px-6 py-8 mb-8 text-center">
                    <h2 className="text-xl font-bold text-white mb-3">Our Mission</h2>
                    <p className="text-sm text-white/70 leading-relaxed">
                        To make ingredient transparency accessible to everyone. We believe every consumer deserves to know exactly what they're putting on their body — clearly, quickly, and without needing a chemistry degree.
                    </p>
                </div>

                {/* Features */}
                <div className="flex flex-col gap-4 mb-10">
                    {FEATURES.map((feature) => (
                        <div
                            key={feature.title}
                            className="flex items-start gap-4 bg-white border border-border rounded-2xl px-5 py-4"
                        >
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#E7F0EF] text-primary mt-0.5">
                                {feature.icon}
                            </span>
                            <div>
                                <p className="text-sm font-bold text-text-title mb-0.5">{feature.title}</p>
                                <p className="text-sm text-text-body leading-relaxed">{feature.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-10">
                    {[
                        { value: '50k+', label: 'Ingredients Indexed' },
                        { value: '12k+', label: 'Clinical Studies' },
                        { value: '2.4M', label: 'Monthly Scans' },
                        { value: '4.9/5', label: 'Safety Rating' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-[#E7F0EF] rounded-2xl px-4 py-5 text-center">
                            <p className="text-2xl font-bold text-primary">{stat.value}</p>
                            <p className="text-xs text-text-secondary mt-1">{stat.label}</p>
                        </div>
                    ))}
                </div>

                {/* Links */}
                <div className="flex flex-col gap-3 mb-10">
                    <button
                        type="button"
                        onClick={() => navigate('/privacy')}
                        className="flex items-center justify-between w-full bg-white border border-border rounded-2xl px-5 py-4 hover:border-primary/40 transition-colors"
                    >
                        <span className="text-sm font-semibold text-text-title">Privacy Policy & Disclaimer</span>
                        <svg className="h-4 w-4 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>

                {/* Footer */}
                <div className="pt-6 border-t border-border text-center">
                    <p className="text-xs text-text-secondary">© 2026 SafeScan Technology · Built for a healthier world.</p>
                    <p className="text-xs text-text-secondary mt-1">support@safescan.app</p>
                </div>

            </div>
        </div>
    )
}
