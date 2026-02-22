export const SAFETY_CONFIG = {
    safe: {
        label: 'Safe',
        historyLabel: 'Safe',
        className: 'bg-[#ECF8EF] text-[#43B75D] border border-[#43B75D]',
    },
    risky: {
        label: 'Risky',
        historyLabel: 'Risky',
        className: 'bg-[#FFF7E6] text-risky border border-risky',
    },
    restricted: {
        label: 'Restricted',
        historyLabel: 'Danger',
        className: 'bg-[#FDECEC] text-danger border border-danger',
    },
}

export const INGREDIENTS = [
    {
        id: 1,
        name: 'Retinol',
        safety: 'risky',
        description: 'A derivative of Vitamin A used for anti-aging. Can cause sensitivity to sunlight.',
        clinicalUrl: '#',
    },
    {
        id: 2,
        name: 'Hyaluronic Acid',
        safety: 'safe',
        description: 'A naturally occurring substance in the skin that helps retain moisture.',
        clinicalUrl: '#',
    },
    {
        id: 3,
        name: 'Sulphates',
        safety: 'restricted',
        description: 'Harsh cleansing agents that can strip skin of natural oils and cause irritation.',
        clinicalUrl: '#',
    },
    {
        id: 4,
        name: 'Niacinamide',
        safety: 'safe',
        description: 'Vitamin B3, excellent for skin barrier support and evening out skin tone.',
        clinicalUrl: '#',
    },
    {
        id: 5,
        name: 'Phthalates',
        safety: 'restricted',
        description: 'Industrial chemicals used to soften plastics, linked to hormonal disruption.',
        clinicalUrl: '#',
    },
    {
        id: 6,
        name: 'Aloe Vera',
        safety: 'safe',
        description: 'Plant-derived ingredient known for its soothing and moisturizing properties.',
        clinicalUrl: '#',
    },
]
