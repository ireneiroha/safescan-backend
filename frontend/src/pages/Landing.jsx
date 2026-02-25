import Hero from "../components/landing/Hero";
import ProductImg from "../components/landing/ProductImg";
import FeatureCard from "../components/landing/FeatureCard";
import StatItem from "../components/landing/StatItem";
import GlobeIcon from '../assets/icons/global.svg?react'
import ShieldIcon from '../assets/icons/shield.svg?react'
import FlashIcon from '../assets/icons/flash.svg?react'
import StarIcon from '../assets/icons/star.svg?react'
import Button from "../components/ui/Button";
import Footer from "../components/layout/Footer";
import { useNavigate } from "react-router-dom";

export default function Landing() {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col min-h-screen">
            <main className="flex-1 px-4 pt-5 pb-6 max-w-md mx-auto w-full lg:max-w-6xl lg:px-10 lg:pt-8 lg:pb-10">

                <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center lg:mb-24 lg:min-h-[calc(100vh-96px)] pt-8">
                    <Hero />
                    <ProductImg />
                </div>

                {/* Features section */}
                <div className="mb-4 lg:mb-24">
                    <h2 className="text-[32px] font-bold text-text-title text-center mb-2 lg:text-[40px]">
                        Everything you need for safe shopping.
                    </h2>
                    <p className="text-base text-text-body text-center mb-8 lg:text-lg lg:mb-14">
                        SafeScan combines AI label recognition with the world's largest clinical database.
                    </p>
                    <div className="lg:grid lg:grid-cols-3 lg:gap-6">
                        <FeatureCard
                            title="Live Label Scanning"
                            description="Point your camera at any ingredient list. Our AI reads even the smallest text instantly."
                            icon={
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            title="Personalized Flags"
                            description="Set your own sensitivities. We'll alert you if a product contains your specific allergens."
                            icon={
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                </svg>
                            }
                        />
                        <FeatureCard
                            title="Deep Search"
                            description="Access clinical studies and safety ratings for over 50,000 cosmetic ingredients."
                            icon={
                                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                                </svg>
                            }
                        />
                    </div>
                </div>

                {/* Stats section */}
                <div className="mb-10 lg:mb-24 lg:grid lg:grid-cols-4">
                    <StatItem value="50k+"  label="Ingredients Indexed" icon={<GlobeIcon />} />
                    <StatItem value="12k+"  label="Clinical Studies"    icon={<ShieldIcon />} />
                    <StatItem value="2.4M"  label="Monthly Scans"       icon={<FlashIcon />} />
                    <StatItem value="4.9/5" label="Safety Rating"       icon={<StarIcon />} />
                </div>

                {/* CTA banner */}
                <div className="bg-[#052A27] rounded-3xl px-6 py-8 flex flex-col justify-center items-center text-center mb-6 h-[450px] lg:h-auto lg:px-16 lg:py-25 lg:mb-0 lg:gap-5">
                    <h2 className="text-[32px] font-bold text-white mb-4 leading-tight lg:text-5xl lg:max-w-xl">
                        Ready to scan your first product?
                    </h2>
                    <p className="text-lg text-white/60 leading-relaxed mb-8 lg:max-w-lg">
                        Join 1 million users who trust SafeScan for their daily beauty
                        and health choices. It's free, fast, and science-backed.
                    </p>
                    <div className="w-full lg:w-[330px]">
                        <Button
                            text="Get Started for Free"
                            variant="primary"
                            onClick={() => navigate('/register')}
                        />
                    </div>
                </div>
            </main>

            <div>
                <Footer />
            </div>
        </div>
    )
}