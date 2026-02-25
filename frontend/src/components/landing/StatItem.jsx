export default function StatItem({ icon, value, label }) {
    return (
        <div className="flex flex-col items-center py-8 last:border-0 lg:py-14 lg:px-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-[50px] bg-[#E7F0EF] text-primary mb-4 lg:h-16 lg:w-16 lg:mb-7">
                <span className="lg:[&>svg]:h-7 lg:[&>svg]:w-7">{icon}</span>
            </div>
            <p className="text-4xl font-bold text-text-title mb-1 lg:text-5xl lg:mb-3">{value}</p>
            <p className="text-xs font-semibold tracking-widest text-text-secondary uppercase lg:text-sm">{label}</p>
        </div>
    )
}