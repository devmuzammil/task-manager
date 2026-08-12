import { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { verifyEmail } from '../services/api'
import { AuthContext } from '../context/AuthContext'

export default function VerifyEmailPage() {
  const { userId, token } = useParams()
  const { setAuth } = useContext(AuthContext)
  const navigate = useNavigate()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    verifyEmail(userId, token)
      .then((data) => {
        setStatus('success')
        setMessage(data.message || 'Email verified successfully.')
        const nextAuth = {
          access: data.access,
          refresh: data.refresh,
          user: null,
        }
        localStorage.setItem('task-manager-auth', JSON.stringify(nextAuth))
        setAuth(nextAuth)
        window.setTimeout(() => {
          navigate('/dashboard', { replace: true })
        }, 1600)
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.body?.error || 'Invalid or expired verification link.')
      })
  }, [userId, token, navigate, setAuth])

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-slate-900">Email verification</h1>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-700">
          {status === 'loading' ? 'Verifying your email…' : message}
        </div>
        {status === 'success' && (
          <div className="mt-6 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-700">
            Redirecting to your dashboard…
          </div>
        )}
      </div>
    </div>
  )
}
