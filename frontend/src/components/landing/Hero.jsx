import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button'
import StarsIcon from '../../assets/icons/stars.svg?react'

export default function Hero() {
    const navigate = useNavigate()

    return (
        <div className="flex flex-col items-center text-center mb-10">
            <div className="bg-[#E7F0EF] rounded-full px-5 py-2.5 mb-6 w-full h-[56px]">
                <p className="text-sm font-bold text-primary">
                    Trusted by 1M+ health-<br />conscious users
                </p>
            </div>
            <h1 className="text-4xl font-bold text-text-title leading-tight mb-6">
                Know what's{' '}
                <span className="text-primary">inside</span>{' '}
                every bottle.
            </h1>
            <p className="text-lg text-text-body leading-relaxed max-w-xs mb-7">
                Instantly scan product labels to identify toxic ingredients, allergens,
                and clinical safety ratings tailored to your unique skin profile.
            </p>
            <Button
                text="Launch Web App"
                variant="primary"
                onClick={() => navigate('/register')}
                showArrow
            />
            {/* Social proof */}
            <div className="flex items-center gap-3 mt-5">
                <div className="flex -space-x-2">
                    {['1', '3', '5', '8'].map((id) => (
                        <img key={id} src={`https://i.pravatar.cc/32?img=${id}`} alt="User"
                            className="h-8 w-8 rounded-full border-2 border-white object-cover" />
                    ))}
                </div>
                <div className="flex flex-col items-center gap">
                    <StarsIcon />
                    <span className="text-xs font-bold text-text-secondary">4.9/5 RATING</span>
                </div>
            </div>
        </div>
    )
}