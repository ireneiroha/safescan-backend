import { useNavigate, useParams } from "react-router-dom";
import ScanImg from '../assets/images/scanImg.svg';
import SummaryBadge from "../components/ingredients/SummaryBadge";
import IngredientResultCard from "../components/ingredients/IngredientResultCard";
import Button from "../components/ui/Button";

const RISK_CONFIG = {
    restricted: {
        label: 'High Risk Detected',
        description: 'Contains ingredients that are restricted or of concern.',
        badge: 'Restricted',
        bannerClass: 'bg-[#FDECEC] border border-[#F5C2C2]',
        labelClass: 'text-danger',
        iconClass: 'text-danger',
        badgeClass: 'bg-[#FDECEC] text-danger border border-danger',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
    risky: {
        label: 'Caution Advised',
        description: 'Some ingredients may cause sensitivity or irritation for certain skin types.',
        badge: 'Risky',
        bannerClass: 'bg-[#FFF7E6] border border-[#FDDFA0]',
        labelClass: 'text-risky',
        iconClass: 'text-risky',
        badgeClass: 'bg-[#FFF7E6] text-risky border border-risky',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
    },
    safe: {
        label: 'All Clear',
        description: 'No harmful or restricted ingredients detected in this product.',
        badge: 'Safe',
        bannerClass: 'bg-[#ECF8EF] border border-[#A3D9B1]',
        labelClass: 'text-[#43B75D]',
        iconClass: 'text-[#43B75D]',
        badgeClass: 'bg-[#ECF8EF] text-[#43B75D] border border-[#43B75D]',
        icon: (
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
    },
}

const MOCK_RESULT = {
    id: 1,
    productName: 'Hydration Boost Serum',
    productSubtitle: 'Hydrating Serum',
    productImage: ScanImg,
    safety: 'restricted',
    category: 'skincare',
    scannedAt: new Date().toISOString(),
    ingredients: [
        { id: 1, name: 'Parabens', safety: 'restricted', description: 'Synthetic preservatives linked to endocrine disruption in some studies.' },
        { id: 2, name: 'Alcohol Denat', safety: 'restricted', description: 'Dries skin and allows other chemicals to penetrate deeper.' },
        { id: 3, name: 'Glycolic Acid', safety: 'risky', description: 'Removes dead skin but makes you 50% more likely to sunburn.' },
        { id: 4, name: 'Phenoxyethanol', safety: 'risky', description: 'Safe at 1%, but high exposure is linked to infant health issues.' },
        { id: 5, name: 'Niacinamide', safety: 'safe', description: 'Safe alternative to lighteners; fixes uneven skin tone.' },
        { id: 6, name: 'Glycerin', safety: 'safe', description: 'A universal moisture-magnet for skin and hair.' },
    ]
}

export default function Results() {
    const { id } = useParams()
    const navigate = useNavigate()
    const result = MOCK_RESULT
    const risk = RISK_CONFIG[result.safety]

    const safeCount = result.ingredients.filter(i => i.safety === 'safe').length
    const riskyCount = result.ingredients.filter(i => i.safety === 'risky').length
    const restrictedCount = result.ingredients.filter(i => i.safety === 'restricted').length

    const SAFETY_ORDER = { restricted: 0, risky: 1, safe: 2 }
    const sortedIngredients = [...result.ingredients].sort(
        (a, b) => SAFETY_ORDER[a.safety] - SAFETY_ORDER[b.safety]
    )

    // const [result, setResult] = useState(null)
    // const [loading, setLoading] = useState(true)
    // useEffect(() => {
    //   const fetchResult = async () => {
    //     try {
    //       const token = localStorage.getItem('token')
    //       const res = await fetch(`/api/scan-history/${id}`, {
    //         headers: { Authorization: `Bearer ${token}` }
    //       })
    //       const data = await res.json()
    //       setResult(data)
    //     } catch (err) {
    //       console.error('Failed to fetch scan result:', err)
    //     } finally {
    //       setLoading(false)
    //     }
    //   }
    //   fetchResult()
    // }, [id])

    return (
        <div className="mx-auto max-w-md md:max-w-[1440px] px-4 py-6 md:px-10 md:py-8">

            <div className="flex items-center justify-between mb-5 md:mb-8">
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-1.5 text-sm font-medium text-text-title hover:text-primary transition-colors"
                >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back
                </button>
                <h1 className="text-base font-bold text-primary">Scan Results</h1>
                <div className="w-12" />
            </div>

            <div className="md:flex md:justify-center">
                <div className="flex flex-col md:flex-row md:gap-16 md:items-start">

                    <div className="md:w-[380px] md:shrink-0 md:flex md:flex-col">
                        <div className="relative rounded-2xl overflow-hidden h-[400px] md:flex-1 mb-4">
                            <img
                                src={result.productImage}
                                alt={result.productName}
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-0 left-0 right-0 p-4">
                                <p className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-1">
                                    {result.productSubtitle}
                                </p>
                                <h2 className="text-xl font-bold text-white leading-tight">
                                    {result.productName}
                                </h2>
                            </div>
                        </div>
                        <Button
                            text="Scan Another"
                            variant="primary"
                            onClick={() => navigate('/scan-home')}
                        />
                    </div>

                    <div className="flex-1 mt-5 md:max-w-[520px] md:mt-0">

                        <div className={`rounded-2xl p-4 mb-5 ${risk.bannerClass}`}>
                            <div className={`flex items-center gap-2 mb-2 ${risk.iconClass}`}>
                                {risk.icon}
                                <p className={`font-bold text-base ${risk.labelClass}`}>{risk.label}</p>
                            </div>
                            <p className="text-sm text-text-body mb-3">{risk.description}</p>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-text-secondary">
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                    Category detected:
                                    <span className="text-text-title font-medium capitalize">{result.category}</span>
                                </div>
                                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border ${risk.badgeClass}`}>
                                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    {risk.badge}
                                </span>
                            </div>
                            <button type="button" className="mt-3 text-sm font-semibold text-primary hover:underline">
                                Change category
                            </button>
                        </div>

                        <div className="mb-4">
                            <p className="text-base font-bold text-text-title mb-3">Summary</p>
                            <div className="flex gap-3">
                                <SummaryBadge count={safeCount} label="Safe" dotClass="bg-[#43B75D]" badgeClass="bg-[#ECF8EF] text-[#43B75D] border-[#43B75D]" />
                                <SummaryBadge count={riskyCount} label="Risky" dotClass="bg-risky" badgeClass="bg-[#FFF7E6] text-risky border-risky" />
                                <SummaryBadge count={restrictedCount} label="Restricted" dotClass="bg-danger" badgeClass="bg-[#FDECEC] text-danger border-danger" />
                            </div>
                        </div>

                        <div className="mb-6">
                            <p className="text-base font-bold text-text-title mb-3">Ingredient Analysis</p>
                            <div className="flex flex-col gap-3">
                                {sortedIngredients.map((ingredient) => (
                                    <IngredientResultCard key={ingredient.id} {...ingredient} />
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}