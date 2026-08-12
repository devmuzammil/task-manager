import { Routes, Route, Navigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import VerifyEmailPage from './pages/VerifyEmailPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
import DashboardPage from './pages/DashboardPage'
import { AuthContext } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const [auth, setAuth] = useState(() => {
    const stored = localStorage.getItem('task-manager-auth')
    return stored ? JSON.parse(stored) : { access: null, refresh: null, user: null }
  })

  const value = useMemo(() => ({ auth, setAuth }), [auth])

  return (
    <AuthContext.Provider value={value}>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email/:userId/:token" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:userId/:token" element={<ResetPasswordPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </AuthContext.Provider>
  )
}

export default App
