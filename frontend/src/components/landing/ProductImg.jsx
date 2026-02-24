import ProductImage from '../../assets/images/productImg.png'
import FlaggedIcon from '../../assets/icons/flagged.svg?react'

export default function ProductImg() {
    return (
        <div className="flex justify-center relative mb-10">
            <div className="relative">
                <div className="p-4 bg-white rounded-[28px] shadow-xl/20">
                    <div className="rounded-3xl overflow-hidden">
                        <img
                            src={ProductImage}
                            alt="Skincare products"
                            className="w-[281px] h-[352px] object-cover"
                        />
                    </div>
                </div>

                {/* Flagged ingredient badge */}
                <div className="absolute top-18 -left-5 flex items-center gap-2.5 bg-white rounded-2xl px-3 py-2.5 shadow-xl/20 h-[75px] w-[194px]">
                    <FlaggedIcon />
                    <div>
                        <p className="text-xs font-bold text-text-title">Flagged Ingredient</p>
                        <p className="text-xs text-text-secondary">Parabens Detected</p>
                    </div>
                </div>

                {/* Safety score badge */}
                <div className="absolute bottom-28 -right-6 flex items-center gap-2 bg-primary rounded-2xl px-3 py-2.5 shadow-xl/20 h-[63px] w-[168px]">
                    <svg className="h-4 w-4 text-white shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                        <p className="text-xs font-bold text-white">98% Safety Score</p>
                        <p className="text-xs text-white/70">Clinically Approved</p>
                    </div>
                </div>
            </div>
        </div>
    )
}