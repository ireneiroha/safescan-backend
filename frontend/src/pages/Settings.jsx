import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import PreferenceRow from '../components/profile/PreferenceRow'
import NotificationIcon from '../assets/icons/notification.svg?react'
import SubscriptionIcon from '../assets/icons/subscription.svg?react'
import InfoIcon from '../assets/icons/info.svg?react'
import LogoutIcon from '../assets/icons/logout.svg?react'
import NotificationsModal from '../modals/NotificationsModal'
import SubscriptionModal from '../modals/SubscriptionModal'

function getInitials(name) {
    if (!name) return 'U'
    return name.trim().split(' ').map(n => n[0].toUpperCase()).slice(0, 2).join('')
}

function InitialsAvatar({ name }) {
    return (
        <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-md shrink-0">
            <span className="text-2xl font-bold text-white">{getInitials(name)}</span>
        </div>
    )
}

export default function Settings() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [activeModal, setActiveModal] = useState(null)

    const profile = {
        name: user?.name ?? 'User',
        avatar: user?.avatar ?? null,
        plan: user?.plan ?? 'SafeScan Member',
        memberSince: user?.createdAt
            ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
            : '—',
        subscription: user?.subscription ?? 'Free Plan',
        version: 'v1.0.4',
    }

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <>
            {activeModal === 'notifications' && (
                <NotificationsModal onClose={() => setActiveModal(null)} />
            )}
            {activeModal === 'subscription' && (
                <SubscriptionModal onClose={() => setActiveModal(null)} />
            )}

            <div className="mx-auto max-w-md md:max-w-[1440px] px-4 py-6 md:py-10 md:px-10">

                <div className="hidden md:flex items-center gap-2 mb-8">
                    <svg className="h-5 w-5 text-text-title" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <h1 className="text-xl font-bold text-text-title">Settings</h1>
                </div>

                <div className="md:max-w-2xl md:mx-auto">

                    {/* Profile card */}
                    <div className="bg-[#E7F0EF] rounded-3xl p-6 mb-6 flex flex-col items-center md:flex-row md:items-center md:gap-5">

                        <div className="relative mb-3 md:mb-0 shrink-0">
                            {profile.avatar ? (
                                <img
                                    src={profile.avatar}
                                    alt={profile.name}
                                    className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-md"
                                />
                            ) : (
                                <InitialsAvatar name={profile.name} />
                            )}
                            <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-[#43B75D] border-2 border-white" />
                        </div>

                        <div className="flex-1 text-center md:text-left mb-3 md:mb-0">
                            <h2 className="text-2xl font-bold text-text-title">{profile.name}</h2>
                            <p className="text-sm text-text-secondary mt-0.5">
                                {profile.plan} • Since {profile.memberSince}
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={() => navigate('/edit-profile')}
                            className="w-full md:w-auto rounded-xl border border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-white/60 transition-colors shrink-0"
                        >
                            Edit Profile
                        </button>
                    </div>

                    {/* Preferences */}
                    <div>
                        <h3 className="text-lg font-bold text-text-title mb-4 md:mb-5">Preferences</h3>

                        <div className="border-[0.3px] border-border rounded-3xl px-4 py-2 md:py-4 md:border-0 md:rounded-none">
                            <PreferenceRow
                                label="Notifications"
                                value="Managed"
                                icon={<NotificationIcon />}
                                onClick={() => setActiveModal('notifications')}
                            />
                            <PreferenceRow
                                label="Subscription"
                                value={profile.subscription}
                                valueClass="bg-teal-50 text-primary text-xs font-semibold px-3 py-1 rounded-full border border-primary/20"
                                icon={<SubscriptionIcon />}
                                onClick={() => setActiveModal('subscription')}
                            />
                            <PreferenceRow
                                label="About SafeScan"
                                value={profile.version}
                                icon={<InfoIcon />}
                                onClick={() => navigate('/about')}
                            />
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="flex w-full items-center gap-4 py-5 md:py-6 px-1 rounded-xl hover:bg-red-50 transition-colors"
                            >
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6]">
                                    <LogoutIcon />
                                </span>
                                <span className="text-sm font-bold text-danger">Log Out</span>
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </>
    )
}