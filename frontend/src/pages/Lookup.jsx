import { useState, useMemo } from 'react'
import Search from '../assets/icons/search.svg?react'
import EmptyState from '../components/ingredients/EmptyState'
import IngredientCard from '../components/ingredients/IngredientCard'
import { INGREDIENTS } from '../constants/ingredients'

export default function Lookup() {
    const [query, setQuery] = useState('')

    // useEffect(() => {
    //     const fetchIngredients = async () => {
    //         try {
    //             const res = await fetch('/api/ingredients')
    //             const data = await res.json()
    //             setIngredients(data)
    //         } catch (err) {
    //             console.error('Failed to fetch ingredients:', err)
    //         }
    //     }
    //     fetchIngredients()
    // }, [])

    const filtered = useMemo(() => {
        if (!query.trim()) return INGREDIENTS
        return INGREDIENTS.filter((ing) =>
            ing.name.toLowerCase().includes(query.toLowerCase())
        )
    }, [query])

    return (
        <div className="mx-auto max-w-md md:max-w-[1440px] px-4 py-6 md:px-10 md:py-10">

            <h1 className="text-2xl font-bold text-text-title mb-5 md:mb-8">Ingredient Lookup</h1>

            <div className="md:max-w-2xl md:mx-auto">

                <div className="relative mb-5">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Search chemical name or ingredient...."
                        className="w-full rounded-xl border border-border bg-white py-3 pl-10 pr-4 text-sm text-text-secondary placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {filtered.length > 0 && (
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-sm font-medium text-text-title">
                            <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                            Common Ingredients
                        </div>
                        <span className="text-sm text-text-secondary">{filtered.length} found</span>
                    </div>
                )}

                {filtered.length === 0 ? (
                    <EmptyState query={query} />
                ) : (
                    <div className="flex flex-col gap-3 md:grid md:grid-cols-2 md:gap-8">
                        {filtered.map((ingredient) => (
                            <IngredientCard key={ingredient.id} {...ingredient} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}