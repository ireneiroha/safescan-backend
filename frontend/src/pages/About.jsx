import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

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
            { threshold: 0.12 }
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
        badge: 'bg-[#E7F0EF] text-primary',
        hover: 'hover:border-primary/40 hover:bg-[#f8fdfc]',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        number: '02',
        title: 'Verify',
        description: 'Our AI extracts the text. You can quickly edit it to ensure 100% accuracy.',
        badge: 'bg-blue-50 text-blue-600',
        hover: 'hover:border-blue-200 hover:bg-blue-50/40',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
    },
    {
        number: '03',
        title: 'Analyze',
        description: 'We match the ingredients against global safety standards (INCI).',
        badge: 'bg-amber-50 text-amber-600',
        hover: 'hover:border-amber-200 hover:bg-amber-50/40',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18" />
            </svg>
        ),
    },
    {
        number: '04',
        title: 'Decide',
        description: 'View your instant, color-coded safety report.',
        badge: 'bg-emerald-50 text-emerald-600',
        hover: 'hover:border-emerald-200 hover:bg-emerald-50/40',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        ),
    },
]

const SAFETY_KEY = [
    {
        dot: 'bg-[#43B75D]',
        emoji: '🟢',
        label: 'Safe',
        description: 'No known health risks.',
        pill: 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100/60',
        text: 'text-emerald-700',
    },
    {
        dot: 'bg-[#FFAA00]',
        emoji: '🟠',
        label: 'Restricted',
        description: 'Use with caution (may cause sensitivity).',
        pill: 'bg-amber-50 border-amber-100 hover:bg-amber-100/60',
        text: 'text-amber-700',
    },
    {
        dot: 'bg-[#EE443F]',
        emoji: '🔴',
        label: 'Risky',
        description: 'Linked to potential health or environmental concerns.',
        pill: 'bg-red-50 border-red-100 hover:bg-red-100/60',
        text: 'text-red-600',
    },
    {
        dot: 'bg-[#D1D5DB]',
        emoji: '⚪',
        label: 'Unknown',
        description: 'Not in our database yet — proceed with care!',
        pill: 'bg-gray-50 border-gray-100 hover:bg-gray-100/60',
        text: 'text-gray-500',
    },
]

export default function About() {
    const navigate = useNavigate()

    const heroRef    = useRef(null)
    const whatRef    = useFadeIn(0)
    const howRef     = useFadeIn(0)
    const step0      = useFadeIn(0.05)
    const step1      = useFadeIn(0.13)
    const step2      = useFadeIn(0.21)
    const step3      = useFadeIn(0.29)
    const key0       = useFadeIn(0.05)
    const key1       = useFadeIn(0.13)
    const key2       = useFadeIn(0.21)
    const key3       = useFadeIn(0.29)
    const privacyRef = useFadeIn(0)
    const footerRef  = useFadeIn(0)

    const stepRefs = [step0, step1, step2, step3]
    const keyRefs  = [key0, key1, key2, key3]

    useEffect(() => {
        const el = heroRef.current
        if (!el) return
        el.style.animationDelay = '0.05s'
        el.classList.add('animate-fade-in-up')
    }, [])

    return (
        <div className="min-h-screen bg-bg-primary overflow-x-hidden">
            <div className="mx-auto max-w-2xl px-4 py-10 md:px-8 md:py-14">

                {/* Back */}
                <button
                    type="button"
                    onClick={() => navigate('/settings')}
                    className="group flex items-center gap-1.5 text-sm font-medium text-text-secondary hover:text-primary transition-all duration-200 mb-10"
                >
                    <svg
                        className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>

                {/* ── Hero ── */}
                <div ref={heroRef} className="opacity-0 relative text-center mb-14">
                    {/* Decorative glow blob */}
                    <div
                        className="pointer-events-none absolute inset-0 -z-10 mx-auto rounded-full blur-3xl opacity-20"
                        style={{ background: 'radial-gradient(circle, #0D645D 0%, transparent 70%)', height: '200px' }}
                    />

                    <div className="inline-flex items-center gap-2 bg-[#E7F0EF] rounded-full px-4 py-1.5 mb-5">
                        <span className="h-2 w-2 rounded-full bg-primary animate-pulse-dot" />
                        <span className="text-xs font-semibold text-primary tracking-wide uppercase">AI-Powered</span>
                    </div>

                    <h1 className="animate-shimmer text-4xl font-black leading-tight mb-3 md:text-5xl">
                        Welcome to SafeScan
                    </h1>
                    <p className="text-base font-semibold text-deep-teal md:text-lg">
                        Your Pocket Safety Assistant.
                    </p>
                </div>

                {/* ── What is SafeScan ── */}
                <div ref={whatRef} className="opacity-0 mb-10">
                    <div className="rounded-2xl border border-border bg-white px-6 py-5 border-l-4 border-l-primary transition-shadow duration-300 hover:shadow-md">
                        <h2 className="text-base font-bold text-text-title mb-2">What is SafeScan?</h2>
                        <p className="text-sm text-text-body leading-relaxed">
                            SafeScan is an AI-powered tool built to help you navigate the complex world of product
                            ingredients. Whether you're at the supermarket or shopping online from your desktop, we
                            help you identify hidden chemicals in seconds.
                        </p>
                    </div>
                </div>

                {/* ── How it Works ── */}
                <div className="mb-10">
                    <div ref={howRef} className="opacity-0 mb-5">
                        <h2 className="text-xl font-bold text-text-title">How it Works</h2>
                    </div>

                    <div className="flex flex-col gap-3">
                        {STEPS.map((step, i) => (
                            <div
                                key={step.number}
                                ref={stepRefs[i]}
                                className={`
                                    opacity-0 group flex items-start gap-4
                                    bg-white border border-border rounded-2xl px-5 py-4
                                    cursor-default transition-all duration-250
                                    hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98] active:shadow-none
                                    ${step.hover}
                                `}
                            >
                                <span className={`
                                    flex h-10 w-10 shrink-0 items-center justify-center
                                    rounded-full text-sm font-black ${step.badge}
                                    transition-transform duration-200 group-hover:scale-110
                                `}>
                                    {step.number}
                                </span>
                                <div className="pt-0.5 flex-1">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <p className="text-sm font-bold text-text-title">{step.title}</p>
                                        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-text-secondary">
                                            {step.icon}
                                        </span>
                                    </div>
                                    <p className="text-sm text-text-body leading-relaxed">{step.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Safety Key ── */}
                <div className="mb-10">
                    <div ref={key0} className="opacity-0 mb-5">
                        <h2 className="text-xl font-bold text-text-title">The Safety Key</h2>
                    </div>

                    <div className="flex flex-col gap-2.5">
                        {SAFETY_KEY.map((item, i) => (
                            <div
                                key={item.label}
                                ref={keyRefs[i]}
                                className={`
                                    opacity-0 flex items-center gap-3
                                    border rounded-xl px-4 py-3
                                    transition-all duration-200 cursor-default
                                    active:scale-[0.99]
                                    ${item.pill}
                                `}
                            >
                                <span className={`
                                    h-3 w-3 shrink-0 rounded-full ${item.dot} animate-pulse-dot
                                `}
                                    style={{ animationDelay: `${i * 0.4}s` }}
                                />
                                <p className="text-sm leading-relaxed">
                                    <span className={`font-bold ${item.text}`}>{item.label}:</span>{' '}
                                    <span className="text-text-body">{item.description}</span>
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── Privacy Promise ── */}
                <div ref={privacyRef} className="opacity-0 mb-10">
                    <div className="
                        group relative overflow-hidden
                        bg-[#052A27] rounded-3xl px-6 py-8
                        transition-all duration-300
                        hover:shadow-[0_8px_32px_rgba(13,100,93,0.35)]
                        hover:-translate-y-0.5
                    ">
                        {/* Subtle inner glow on hover */}
                        <div className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            style={{ boxShadow: 'inset 0 0 40px rgba(61,131,125,0.2)' }}
                        />

                        <div className="flex items-center gap-2.5 mb-4">
                            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                                <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </span>
                            <h2 className="text-base font-bold text-white">Our Privacy Promise</h2>
                        </div>

                        <p className="text-sm text-white/70 leading-relaxed mb-3">
                            Your data belongs to you. SafeScan does not store your uploaded images. After the text
                            is extracted, the image is permanently deleted.
                        </p>
                        <p className="text-sm text-white/70 leading-relaxed">
                            We are committed to a secure, private, and transparent shopping experience.
                        </p>
                    </div>
                </div>

                {/* ── Footer ── */}
                <div ref={footerRef} className="opacity-0 pt-6 border-t border-border text-center">
                    <p className="text-xs text-text-secondary">© 2026 SafeScan Technology · Built for a healthier world.</p>
                    <p className="text-xs text-text-secondary mt-1">support@safescan.app</p>
                </div>

            </div>
        </div>
    )
}
