import AskAIButton from "./AskAIButton"

const INGREDIENT_DOT = {
    restricted: 'bg-danger',
    risky: 'bg-risky',
    safe: 'bg-[#43B75D]',
    unknown: 'bg-gray-400',
}

const INGREDIENT_BORDER = {
    restricted: 'border-[#FAC5C3]',
    risky: 'border-[#FFE5B0]',
    safe: 'border-[#C5E9CD]',
    unknown: 'border-gray-200',
}

const INGREDIENT_CORNER_ICON = {
    restricted: (
        <span className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-danger text-white">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </span>
    ),
    risky: (
        <span className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-risky text-white">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        </span>
    ),
    safe: null,
    unknown: (
        <span className="absolute top-3 right-3 flex h-6 w-6 items-center justify-center rounded-full bg-gray-400 text-white">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </span>
    ),
}

export default function IngredientResultCard({ name, safety = 'safe', description }) {
    const dot = INGREDIENT_DOT[safety] ?? INGREDIENT_DOT.unknown
    const cornerIcon = INGREDIENT_CORNER_ICON[safety] ?? INGREDIENT_CORNER_ICON.unknown
    const border = INGREDIENT_BORDER[safety] ?? INGREDIENT_BORDER.unknown
    const isUnknown = safety === 'unknown'

    return (
        <div className={`relative rounded-2xl px-4 py-3.5 border ${border} shadow-sm`}>
            {cornerIcon}
            <div className="flex items-center gap-2 mb-1">
                <span className={`h-2.5 w-2.5 rounded-full shrink-0 ${dot}`} />
                <p className="text-sm font-bold text-text-title">{name}</p>
            </div>
            <p className="text-xs text-text-body leading-relaxed pl-4">
                {description || 'Not found in our ingredient database.'}
            </p>
            {isUnknown && <AskAIButton name={name} />}
        </div>
    )
}