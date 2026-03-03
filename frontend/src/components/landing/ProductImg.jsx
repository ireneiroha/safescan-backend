import ProductImage from '../../assets/images/productImg.png'
import FlaggedIcon from '../../assets/icons/flagged.svg?react'

export default function ProductImg() {
    return (
        <div className="flex justify-center relative mb-10 lg:mb-0 lg:justify-end">
            <div className="relative">
                <div className="p-4 bg-white rounded-[28px] shadow-xl/20">
                    <div className="rounded-3xl overflow-hidden">
                        <img
                            src={ProductImage}
                            alt="Skincare products"
                            className="w-[281px] h-[352px] object-cover lg:w-[420px] lg:h-[520px]"
                        />
                    </div>
                </div>

                {/* Flagged ingredient badge */}
                <div className="absolute top-18 -left-5 flex items-center gap-2.5 bg-white rounded-2xl px-3 py-2.5 shadow-xl/20 h-[75px] w-[194px] lg:h-[88px] lg:w-[230px] lg:-left-10 lg:top-24">
                    <FlaggedIcon />
                    <div>
                        <p className="text-xs font-bold text-text-title lg:text-sm">Flagged Ingredient</p>
                        <p className="text-xs text-text-secondary lg:text-sm">Parabens Detected</p>
                    </div>
                </div>

                {/* Safety score badge */}
                <div className="absolute bottom-28 -right-6 flex items-center gap-2 bg-primary rounded-2xl px-3 py-2.5 shadow-xl/20 h-[63px] w-[168px] lg:h-[76px] lg:w-[200px] lg:-right-10 lg:bottom-40">
                    <svg className="h-4 w-4 text-white shrink-0 lg:h-5 lg:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <div>
                        <p className="text-xs font-bold text-white lg:text-sm">98% Safety Score</p>
                        <p className="text-xs text-white/70 lg:text-sm">Clinically Approved</p>
                    </div>
                </div>
            </div>
        </div>
    )
}