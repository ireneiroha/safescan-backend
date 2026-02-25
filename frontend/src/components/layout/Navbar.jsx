import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import SafeScanLogo from '../../assets/logo/safescan-logo.png'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  {
    label: 'Scan',
    path: '/scan-home',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    label: 'Lookup',
    path: '/lookup',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
      </svg>
    ),
  },
  {
    label: 'History',
    path: '/history',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
]

function GuestAvatar() {
  return (
    <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center shrink-0">
      <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    </div>
  )
}

function Toast({ message, visible }) {
  return (
    <div className={`fixed top-5 left-1/2 -translate-x-1/2 z-[60] transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}`}>
      <div className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-lg">
        <svg className="h-4 w-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        {message}
      </div>
    </div>
  )
}

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState({ visible: false, message: '' })
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const showToast = (message) => {
    setToast({ visible: true, message })
    setTimeout(() => setToast({ visible: false, message: '' }), 2000)
  }

  const handleViewProfile = () => {
    if (!user) {
      showToast("You're not logged in. Redirecting...")
      setTimeout(() => { setOpen(false); navigate('/register') }, 2000)
    } else {
      setOpen(false)
      navigate('/settings')
    }
  }

  const handleLogout = () => {
    logout()
    setOpen(false)
    navigate('/')
  }

  return (
    <>
      <Toast message={toast.message} visible={toast.visible} />

      <nav className="sticky top-0 z-30 bg-bg-primary shadow-sm">
        <div className="mx-auto max-w-[1440px] flex items-center justify-between px-4 py-3 md:px-10 md:py-4">

          {/* Logo */}
          <Link to="/">
            <img src={SafeScanLogo} alt="SafeScan logo" className="h-10" />
          </Link>

          <div className="hidden md:flex items-center gap-10">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-teal-50 text-primary font-semibold'
                      : 'text-text-body hover:text-primary hover:bg-teal-50/50'
                  }`}
                >
                  <span className={isActive ? 'text-primary' : 'text-text-secondary'}>
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              )
            })}

            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 mx-1" />

            {/* Avatar */}
            <button
              type="button"
              onClick={handleViewProfile}
              className="ml-1 rounded-full ring-2 ring-transparent hover:ring-primary/30 transition-all"
            >
              {user?.avatar
                ? <img src={user.avatar} alt="User avatar" className="h-9 w-9 rounded-full object-cover" />
                : <GuestAvatar />
              }
            </button>
          </div>

          {/* ── Mobile hamburger ── */}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex md:hidden h-10 w-10 items-center justify-center rounded-lg text-gray-700 hover:bg-teal-500/10 hover:text-teal-600"
            aria-label="Open menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setOpen(false)} />
      )}

      <div className={`fixed top-0 right-0 z-50 h-full w-[285px] bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out md:hidden ${open ? 'translate-x-0' : 'translate-x-full'}`}>
        {/* User profile header */}
        <div className="flex items-center justify-between px-6 pt-8 pb-6">
          <div className="flex items-center gap-3">
            {user?.avatar
              ? <img src={user.avatar} alt="User avatar" className="h-11 w-11 rounded-full object-cover" />
              : <GuestAvatar />
            }
            <div>
              <p className="font-semibold text-gray-900">{user?.name ?? 'User'}</p>
              <button type="button" onClick={handleViewProfile} className="text-xs text-primary hover:underline flex items-center gap-1">
                View Profile
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
          <button type="button" onClick={() => setOpen(false)} className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Drawer nav links */}
        <div className="flex-1 px-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.path
            return (
              <Link
                key={item.label}
                to={item.path}
                onClick={() => setOpen(false)}
                className={`flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-bg-secondary text-primary' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                  isActive ? 'bg-[#D1DEDB] text-primary' : 'bg-[#EEF8F6] text-text-secondary'
                }`}>
                  {item.icon}
                </span>
                {item.label}
                {isActive && <span className="ml-auto h-2 w-2 rounded-full bg-primary" />}
              </Link>
            )
          })}

          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-danger transition-colors"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF8F6] text-text-secondary">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </span>
            Logout
          </button>
        </div>

        {/* Upgrade banner */}
        <div className="mx-4 mb-8 rounded-[16px] bg-primary px-5 py-4 text-white text-center">
          <p className="text-xs font-medium opacity-80">SafeScan Pro</p>
          <p className="text-sm font-medium mt-0.5">Upgrade for unlimited scans</p>
        </div>
      </div>
    </>
  )
}