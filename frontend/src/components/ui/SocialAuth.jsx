import { Link } from 'react-router-dom';
import Apple from '../../assets/icons/apple.svg?react'
import Google from '../../assets/icons/google.svg?react'
import Facebook from '../../assets/icons/facebook.svg?react'

export default function SocialAuth({ auth, alternateLink, redirectTo }) {
    return (
        <div className="flex flex-col items-center gap-4 mt-8">
            <div className="flex items-center w-full gap-3">
                <div className="flex-1 h-px bg-gray-300" />

                <p className="text-sm text-text-body whitespace-nowrap">
                    or {auth} with
                </p>

                <div className="flex-1 h-px bg-gray-300" />
            </div>

            <div className="flex items-center gap-4">
                <a href="https://appleid.apple.com/sign-in" target="_blank" rel="noreferrer" className="p-3 border border-deep-teal rounded-lg cursor-pointer hover:bg-bg-secondary transition">
                    <Apple className="w-5 h-5" />
                </a>

                <a href="https://accounts.google.com" target="_blank" rel="noreferrer" className="p-3 border border-deep-teal rounded-lg cursor-pointer hover:bg-bg-secondary transition">
                    <Google className="w-5 h-5" />
                </a>

                <a href="https://www.facebook.com/login" target="_blank" rel="noreferrer" className="p-3 border border-deep-teal rounded-lg cursor-pointer hover:bg-bg-secondary transition">
                    <Facebook className="w-5 h-5" />
                </a>
            </div>

            <div>
                <p className='text-text-secondary'>
                    Already have an account? {" "}
                    <Link
                    to={redirectTo}
                    className='text-deep-teal'>{alternateLink}</Link>
                </p>
            </div>
        </div>
    );
}