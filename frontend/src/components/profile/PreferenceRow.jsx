export default function PreferenceRow({
    icon,
    label,
    value,
    valueClass = 'text-text-secondary',
    onClick
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center gap-4 py-4 md:py-6 border-b border-gray-100 last:border-0 md:border-b-0 hover:bg-gray-50 transition-colors px-1 rounded-xl"        >
            {/* Icon */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6]">
                {icon}
            </span>

            {/* Label */}
            <span className={`flex-1 text-left text-sm font-bold text-text-title ${onClick ? '' : 'cursor-default'}`}>
                {label}
            </span>

            {/* Value */}
            {value && (
                <span className={`text-sm font-medium ${valueClass}`}>{value}</span>
            )}
        </button>
    )
}