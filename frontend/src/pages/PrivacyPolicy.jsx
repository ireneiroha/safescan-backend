import { useNavigate } from 'react-router-dom'

const SECTIONS = [
    {
        title: '1. Introduction',
        content: `SafeScan is an AI-powered web application that helps users scan product ingredient labels and receive simplified safety classifications. Protecting your privacy and being transparent about data use is core to SafeScan's design.

This Privacy Policy & Disclaimer explains what data we collect, why we collect it, how it is used, and your responsibilities when using the SafeScan MVP.`
    },
    {
        title: '2. Personal Data Collection',
        content: `SafeScan collects the following personal information only when you create an account:`,
        bullets: [
            'Name – used to identify your account',
            'Email address – used to send scan results, notifications, and account-related communications',
        ],
        footer: 'No other personal identity data is collected. Image uploads for scanning are temporarily processed by the system to extract ingredient text. Images are not linked to your personal identity publicly and are deleted after processing.'
    },
    {
        title: '3. Purpose of Data Collection',
        content: 'Your data is collected solely for SafeScan service delivery, including:',
        bullets: [
            'Creating and managing your account',
            'Saving scan history for your personal use',
            'Providing timely notifications about app functionality or updates',
        ],
        footer: 'We do not sell, share, or distribute your personal data to third parties.'
    },
    {
        title: '4. Signup Consent',
        content: 'By creating a SafeScan account and using the service, you:',
        bullets: [
            'Explicitly agree to this Privacy Policy & Disclaimer',
            'Acknowledge that SafeScan collects and processes only the personal information described above',
            'Understand that SafeScan results are informational only and do not constitute medical, legal, or diagnostic advice',
            'Accept that you are responsible for your own decisions regarding product purchases',
        ]
    },
    {
        title: '5. Security & Data Handling',
        bullets: [
            'Account information is encrypted in transit and at rest',
            'Uploaded images are deleted after processing',
            'Access to personal data is limited to essential system processes',
            'We implement standard measures to protect against unauthorized access or disclosure',
        ]
    },
    {
        title: '6. Geographic Scope & Compliance',
        content: 'SafeScan is intended for eligible regions in Africa. Users in countries with strict data protection laws (e.g., South Africa under POPIA, EU GDPR jurisdictions) should use the service responsibly and review local requirements. SafeScan is designed to be POPIA/GDPR-aligned where applicable by:',
        bullets: [
            'Limiting personal data collection',
            'Encrypting stored data',
            'Providing transparent notice and consent',
        ]
    },
    {
        title: '7. Informational Disclaimer',
        content: 'SafeScan provides ingredient safety information based on publicly available sources and AI-powered OCR analysis. Limitations include:',
        bullets: [
            'Accuracy may vary due to OCR errors, label readability, or data limitations',
            'Information may be incomplete, outdated, or region-specific',
            'SafeScan results are informational only, not legally binding, and not a substitute for professional advice',
        ],
        footer: 'Users remain responsible for their own purchasing decisions.'
    },
    {
        title: '8. User Responsibilities',
        bullets: [
            'Ensure uploaded images are clear and legible',
            'Understand that SafeScan does not provide medical or regulatory approvals',
            'Use SafeScan within the intended geographic and legal scope',
        ]
    },
    {
        title: '9. Contact',
        content: 'For questions regarding this Privacy Policy or data handling, please contact us at:',
        footer: 'support@safescan.app'
    },
]

export default function PrivacyPolicy() {
    const navigate = useNavigate()

    return (
        <div className="min-h-screen bg-bg-primary">
            <div className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">

                {/* Header */}
                <button
                    type="button"
                    onClick={() => {
                        if (window.opener) {
                            window.close()
                        } else {
                            // check if user is logged in
                            const token = localStorage.getItem('token')
                            navigate(token ? '/scan-home' : '/login')
                        }
                    }}
                    className="flex items-center gap-1.5 text-sm font-medium text-text-title hover:text-primary transition-colors mb-8"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Close
                </button>

                <div className="mb-8">
                    <div className="inline-flex items-center gap-2 bg-[#E7F0EF] rounded-full px-4 py-1.5 mb-4">
                        <svg className="h-4 w-4 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        <span className="text-sm font-semibold text-primary">POPIA / GDPR Aligned</span>
                    </div>
                    <h1 className="text-3xl font-bold text-text-title mb-2">Privacy Policy & Disclaimer</h1>
                    <p className="text-sm text-text-secondary">SafeScan MVP · Last updated February 2026</p>
                </div>

                {/* Consent summary card */}
                <div className="bg-[#E7F0EF] rounded-2xl p-5 mb-10 border border-primary/20">
                    <p className="text-sm text-text-body leading-relaxed">
                        By creating a SafeScan account, you confirm that your <span className="font-semibold text-text-title">name and email</span> will be used solely for account creation and service delivery. SafeScan results are <span className="font-semibold text-text-title">informational only</span> and do not constitute medical, legal, or diagnostic advice.
                    </p>
                </div>

                {/* Sections */}
                <div className="flex flex-col gap-8">
                    {SECTIONS.map((section) => (
                        <div key={section.title}>
                            <h2 className="text-base font-bold text-text-title mb-2">{section.title}</h2>
                            {section.content && (
                                <p className="text-sm text-text-body leading-relaxed mb-2 whitespace-pre-line">{section.content}</p>
                            )}
                            {section.bullets && (
                                <ul className="flex flex-col gap-1.5 mb-2">
                                    {section.bullets.map((bullet) => (
                                        <li key={bullet} className="flex items-start gap-2 text-sm text-text-body">
                                            <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                                            {bullet}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {section.footer && (
                                <p className="text-sm text-text-body leading-relaxed mt-2">{section.footer}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="mt-12 pt-6 border-t border-border text-center">
                    <p className="text-xs text-text-secondary">© 2026 SafeScan · All rights reserved</p>
                </div>

            </div>
        </div>
    )
}