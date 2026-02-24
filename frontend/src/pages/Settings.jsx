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

export default function Settings() {
    const navigate = useNavigate()
    const { user, logout } = useAuth()
    const [activeModal, setActiveModal] = useState(null)

    const profile = {
        name: user?.name ?? 'User',
        avatar: user?.avatar ?? null,
        plan: user?.plan ?? 'SafeScan Member',
        memberSince: user?.memberSince ?? '—',
        subscription: user?.subscription ?? 'Free Plan',
        version: 'v1.0.4',
    }

    // user object
    // login({
    //   name: data.user.name,
    //   avatar: data.user.avatar,       
    //   plan: data.user.plan,  
    //   memberSince: data.user.memberSince,
    //   subscription: data.user.subscription,
    // }, data.token)

    // useEffect(() => {
    //   const fetchProfile = async () => {
    //     try {
    //       const token = localStorage.getItem('token')
    //       const res = await fetch('/api/user/profile', {
    //         headers: { Authorization: `Bearer ${token}` }
    //       })
    //       const data = await res.json()
    //       login({
    //         name: data.name,
    //         avatar: data.avatar,
    //         plan: data.plan,
    //         memberSince: data.memberSince,
    //         subscription: data.subscription,
    //       }, localStorage.getItem('token'))
    //     } catch (err) {
    //       console.error('Failed to fetch profile:', err)
    //     }
    //   }
    //   fetchProfile()
    // }, [])

    const handleLogout = () => {
        logout()
        navigate('/login')
    }

    return (
        <>
            {/* Modals */}
            {activeModal === 'notifications' && (
                <NotificationsModal onClose={() => setActiveModal(null)} />
            )}
            {activeModal === 'subscription' && (
                <SubscriptionModal onClose={() => setActiveModal(null)} />
            )}

            <div className="mx-auto max-w-md px-4 py-6">
                {/* Profile card */}
                <div className="bg-[#E7F0EF] rounded-3xl p-6 flex flex-col items-center mb-6">
                    <div className="relative mb-3">
                        {profile.avatar ? (
                            <img src={profile.avatar} alt={profile.name}
                                className="h-20 w-20 rounded-full object-cover border-2 border-white shadow-md" />
                        ) : (
                            <div className="h-20 w-20 rounded-full bg-primary flex items-center justify-center border-2 border-white shadow-md">
                                <svg className="h-10 w-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        )}
                        <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full bg-[#43B75D] border-2 border-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-text-title mb-0.5">{profile.name}</h2>
                    <p className="text-base text-text-secondary text-center">
                        {profile.plan}<br />Since {profile.memberSince}
                    </p>
                    <button
                        type="button"
                        onClick={() => navigate('/edit-profile')}
                        className="mt-4 rounded-xl border border-primary px-5 py-2 text-sm font-semibold text-primary hover:bg-gray-100 transition-colors"
                    >
                        Edit profile
                    </button>
                </div>

                {/* Preferences */}
                <div className="border-[0.3px] border-border rounded-3xl px-4 py-2">
                    <h3 className="text-lg font-bold text-text-title pt-3 pb-1 px-1">Preferences</h3>

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

                    {/* Logout */}
                    <button
                        type="button"
                        onClick={handleLogout}
                        className="flex w-full items-center gap-4 py-4 px-1 rounded-xl hover:bg-red-50 transition-colors"
                    >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6]">
                            <LogoutIcon />
                        </span>
                        <span className="text-sm font-bold text-danger">Log Out</span>
                    </button>
                </div>
            </div>
        </>
    )
}