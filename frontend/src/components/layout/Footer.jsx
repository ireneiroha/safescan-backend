import SafeScanLogo from '../../assets/logo/safescan-logo.png'

export default function Footer() {
    const links = {
        Privacy: { href: '/privacy', external: false },
        Terms: { href: '/privacy', external: false },
        Twitter: { href: 'https://twitter.com', external: true },
        Instagram: { href: 'https://instagram.com', external: true },
    }

    return (
        <footer className="sticky bottom-0 bg-bg-primary border-t border-gray-100 px-6 py-6 lg:py-8">
            <div className="flex justify-center mb-4">
                <img src={SafeScanLogo} alt="SafeScan logo" className="h-7.5 lg:h-12" />
            </div>
            <div className="flex items-center justify-center gap-6 mb-4 lg:gap-10">
                {Object.entries(links).map(([label, { href, external }]) => (
                    <a
                        key={label}
                        href={href}
                        target={external ? '_blank' : '_self'}
                        rel={external ? 'noopener noreferrer' : undefined}
                        className="text-xs font-bold text-text-body hover:text-primary transition-colors lg:text-sm"
                    >
                        {label}
                    </a>
                ))}
            </div>
            <p className="text-center text-[10px] text-text-secondary lg:text-sm">
                © 2026 SafeScan Technology. Built for a healthier world.
            </p>
        </footer>
    )
}