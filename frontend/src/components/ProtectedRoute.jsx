import { useContext, useEffect, useState } from 'react'
import { AuthContext } from '../context/AuthContext'
import { Navigate, useLocation } from 'react-router-dom'
import { refreshToken } from '../services/api'

export default function ProtectedRoute({ children }) {
  const { auth, setAuth } = useContext(AuthContext)
  const location = useLocation()
  const [checking, setChecking] = useState(!auth.access && Boolean(auth.refresh))

  useEffect(() => {
    if (!auth.access && auth.refresh) {
      refreshToken(auth.refresh).then((data) => {
        if (data?.access) {
          const nextAuth = { ...auth, access: data.access }
          localStorage.setItem('task-manager-auth', JSON.stringify(nextAuth))
          setAuth(nextAuth)
        }
      }).finally(() => {
        setChecking(false)
      })
    } else {
      setChecking(false)
    }
  }, [auth, setAuth])

  if (checking) {
    return <div className="min-h-screen bg-slate-50 px-4 py-8 text-center text-slate-600">Checking session…</div>
  }

  if (!auth.access) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return children
}
