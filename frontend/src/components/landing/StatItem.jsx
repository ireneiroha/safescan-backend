export default function StatItem({ icon, value, label }) {
    return (
        <div className="flex flex-col items-center py-8 last:border-0">
            <div className="flex h-12 w-12 items-center justify-center rounded-[50px] bg-[#E7F0EF] text-primary mb-4">
                {icon}
            </div>
            <p className="text-4xl font-bold text-text-title mb-1">{value}</p>
            <p className="text-xs font-semibold tracking-widest text-text-secondary uppercase">{label}</p>
        </div>
    )
}