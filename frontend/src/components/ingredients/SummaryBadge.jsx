export default function SummaryBadge({ count, label, dotClass, badgeClass }) {
    if (count === 0) return null

    return (
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full border ${badgeClass}`}>
            <span className={`h-2 w-2 rounded-full ${dotClass}`} />
            {count} {label.toUpperCase()}
        </span>
    )
}