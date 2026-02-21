export default function EmptyState({ query }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D1DEDB] mb-4">
                <svg className="h-8 w-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
            </div>
            <p className="text-base font-semibold text-primary mb-1">
                No results for "{query}"
            </p>
            <p className="text-sm text-text-body max-w-[220px]">
                We couldn't find that ingredient in our database. Try a different name or spelling.
            </p>
        </div>
    )
}