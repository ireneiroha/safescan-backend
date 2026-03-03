import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function PrivateRoute({ children, allowGuest = false }) {
    const { isLoggedIn } = useAuth()

    if (!isLoggedIn && !allowGuest) {
        return <Navigate to="/register" replace />
    }

    return children
}