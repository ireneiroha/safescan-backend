import { useNavigate } from 'react-router-dom'
import { SAFETY_CONFIG } from "../../constants/ingredients"
import SafeIcon from '../../assets/icons/safe.svg?react'
import RiskyIcon from '../../assets/icons/risky.svg?react'
import DangerIcon from '../../assets/icons/danger.svg?react'

const SAFETY_ICONS = {
    safe: <SafeIcon />,
    risky: <RiskyIcon />,
    restricted: <DangerIcon />
}

export default function HistoryCard({ id, productName, time, ingredientCount, safety }) {
    const navigate = useNavigate()
    const config = SAFETY_CONFIG[safety]
    const icon = SAFETY_ICONS[safety]

    return (
        <div className="bg-white rounded-2xl px-4 py-3.5 border border-gray-100 shadow-sm flex items-center gap-3">
            {/* Clock icon */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-bg-secondary">
                <svg className="h-5 w-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-text-title truncate">{productName}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                    {time} • {ingredientCount} ingredients
                </p>
            </div>

            {/* Safety badge */}
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${config.className}`}>
                {icon}
                {config.historyLabel.toUpperCase()}
            </span>

            {/* Arrow */}
            <button
                type="button"
                onClick={() => navigate(`/scan-result/${id}`)}
                className="text-gray-400 hover:text-gray-600 transition-colors shrink-0 ml-1"
                aria-label="View scan details"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </button>
        </div>
    )
}