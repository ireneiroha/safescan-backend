export default function FeatureCard({ icon, title, description }) {
    return (
        <div className="rounded-3xl border border-border shadow-sm px-6 py-8 mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E7F0EF] text-primary mb-5">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-text-title mb-2">{title}</h3>
            <p className="text-sm text-text-body leading-relaxed">{description}</p>
        </div>
    )
}