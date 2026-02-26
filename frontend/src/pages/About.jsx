import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

// Hook: fires callback when element enters viewport
function useFadeIn(delay = 0) {
    const ref = useRef(null)

    useEffect(() => {
        const el = ref.current
        if (!el) return

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    el.style.animationDelay = `${delay}s`
                    el.classList.add('animate-fade-in-up')
                    el.style.opacity = '1'
                    observer.disconnect()
                }
            },
            { threshold: 0.15 }
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [delay])

    return ref
}

const STEPS = [
    {
        number: '01',
        title: 'Capture',
        description: 'Snap a photo of an ingredient label or upload a screenshot.',
        color: 'bg-[#E7F0EF] text-primary',
    },
    {
        number: '02',
        title: 'Verify',
        description: 'Our AI extracts the text. You can quickly edit it to ensure 100% accuracy.',
        color: 'bg-[#EEF6FF] text-blue-600',
    },
    {
        number: '03',
        title: 'Analyze',
        description: 'We match the ingredients against global safety standards (INCI).',
        color: 'bg-[#FFF8EC] text-amber-600',
    },
    {
        number: '04',
        title: 'Decide',
        description: 'View your instant, color-coded safety report.',
        color: 'bg-[#ECFDF5] text-emerald-600',
    },
]

const SAFETY_KEY = [
    { dot: 'bg-safe', label: 'Safe', description: 'No known health risks.' },
    { dot: 'bg-risky', label: 'Restricted', description: 'Use with caution (may cause sensitivity).', dotClass: 'bg-[#FFAA00]' },
    { dot: 'bg-danger', label: 'Risky', description: 'Linked to potential health or environmental concerns.' },
    { dot: 'bg-[#D1D5DB]', label: 'Unknown', description: 'Not in our database yet — proceed with care!' },
]

export default function About() {
    const navigate = useNavigate()

    const heroRef     = useRef(null)
    const whatRef     = useFadeIn(0)
    const howRef      = useFadeIn(0)
    const step0       = useFadeIn(0.05)
    const step1       = useFadeIn(0.15)
    const step2       = useFadeIn(0.25)
    const step3       = useFadeIn(0.35)
    const keyRef      = useFadeIn(0)
    const privacyRef  = useFadeIn(0)
    const stepRefs    = [step0, step1, step2, step3]

    // Hero fades in immediately on mount
    useEffect(() => {
        const el = heroRef.current
        if (!el) return
        el.classList.add('animate-fade-in-up')
    }, [])

    return (
        <div className="min-h-screen bg-bg-primary">
            <div className="mx-auto max-w-2xl px-4 py-10 md:px-8 md:py-14">

                {/* Back */}
                <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="flex items-center gap-1.5 text-sm font-medium text-text-title hover:text-primary transition-colors mb-10"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* Hero */}
                <div ref={heroRef} className="opacity-0 text-center mb-12">
                    <h1 className="text-4xl font-black text-primary leading-tight mb-2">
                        Welcome to SafeScan
                    </h1>
                    <p className="text-lg font-semibold text-primary">
                        Your Pocket Safety Assistant.
                    </p>
                </div>

                {/* What is SafeScan */}
                <div ref={whatRef} className="opacity-0 mb-10">
                    <h2 className="text-xl font-bold text-text-title mb-3">What is SafeScan?</h2>
                    <p className="text-sm text-text-body leading-relaxed">
                        SafeScan is an AI-powered tool built to help you navigate the complex world of product ingredients.
                        Whether you're at the supermarket or shopping online from your desktop, we help you identify hidden
                        chemicals in seconds.
                    </p>
                </div>

                {/* How it Works */}
                <div className="mb-10">
                    <div ref={howRef} className="opacity-0 mb-5">
                        <h2 className="text-xl font-bold text-text-title">How it Works</h2>
                    </div>

                    <div className="flex flex-col gap-3">
                        {STEPS.map((step, i) => (
                            <div
                                key={step.number}
                                ref={stepRefs[i]}
                                className="opacity-0 flex items-start gap-4 bg-white border border-border rounded-2xl px-5 py-4"
                            >
                                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-black ${step.color}`}>
                                    {step.number}
                                </span>
                                <div className="pt-0.5">
                                    <p className="text-sm font-bold text-text-title mb-0.5">{step.title}</p>
                                    <p className="text-sm text-text-body leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Safety Key */}
                <div ref={keyRef} className="opacity-0 mb-10">
                    <h2 className="text-xl font-bold text-text-title mb-5">The Safety Key</h2>
                    <div className="flex flex-col gap-3">
                        {SAFETY_KEY.map((item) => (
                            <div key={item.label} className="flex items-start gap-3">
                                <span className={`mt-1 h-3.5 w-3.5 shrink-0 rounded-full ${item.dotClass ?? item.dot}`} />
                                <p className="text-sm text-text-body leading-relaxed">
                                    <span className="font-bold text-text-title">{item.label}:</span>{' '}
                                    {item.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Privacy Promise */}
                <div ref={privacyRef} className="opacity-0 mb-10">
                    <div className="bg-[#052A27] rounded-3xl px-6 py-8">
                        <div className="flex items-center gap-2 mb-4">
                            <svg className="h-5 w-5 text-white/70 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0-1.1.9-2 2-2s2 .9 2 2-.9 2-2 2-2-.9-2-2zm-6 8a6 6 0 0112 0H6z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 2a10 10 0 100 20A10 10 0 0012 2z" />
                            </svg>
                            <h2 className="text-lg font-bold text-white">Our Privacy Promise</h2>
                        </div>
                        <p className="text-sm text-white/70 leading-relaxed mb-3">
                            Your data belongs to you. SafeScan does not store your uploaded images. After the text is extracted,
                            the image is permanently deleted.
                        </p>
                        <p className="text-sm text-white/70 leading-relaxed">
                            We are committed to a secure, private, and transparent shopping experience.
                        </p>
                    </div>
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
