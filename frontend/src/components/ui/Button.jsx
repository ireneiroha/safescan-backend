export default function Button({
    text,
    loadingText,
    onClick,
    type = "button",
    disabled = false,
    loading= false,
    variant = "primary",
    fullWidth = true,
    className = ""
}) {
    const isDisabled = disabled || loading;

    const base = "rounded-xl p-4 text-sm font-bold transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2";

    const variants = {
        primary: "bg-primary text-bg-input hover:bg-teal-700",
        outline: "border-[1px] border-primary text-primary hover:bg-teal-50",
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={isDisabled}
            className={`${base} ${variants[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
        >
            {loading && (
                <svg
                    className="animate-spin h-4 w-4 shrink-0"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
            )}
            {loading && loadingText ? loadingText : text}
        </button>
    )
}
