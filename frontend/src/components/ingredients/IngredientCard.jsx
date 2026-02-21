import { SAFETY_CONFIG } from '../../constants/ingredients'

export default function IngredientCard({ name, safety, description, clinicalUrl }) {
    const config = SAFETY_CONFIG[safety]

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-base font-bold text-text-title">{name}</h3>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${config.className}`}>
                    {config.label}
                </span>
            </div>
            <p className="text-sm text-text-secondary leading-relaxed mb-3">{description}</p>
            <a
                href={clinicalUrl}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
            >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Clinical Data
            </a>
        </div>
    )

}