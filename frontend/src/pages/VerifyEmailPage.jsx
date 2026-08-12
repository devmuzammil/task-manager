import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { verifyEmail } from '../services/api'

export default function VerifyEmailPage() {
  const { userId, token } = useParams()
  const [status, setStatus] = useState('loading')
  const [message, setMessage] = useState('')

  useEffect(() => {
    verifyEmail(userId, token)
      .then((data) => {
        setStatus('success')
        setMessage(data.message || 'Email verified. You can now sign in.')
      })
      .catch((err) => {
        setStatus('error')
        setMessage(err.body?.error || 'Invalid or expired verification link.')
      })
  }, [userId, token])

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-8 shadow-soft">
        <h1 className="text-2xl font-semibold text-slate-900">Email verification</h1>
        <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-6 text-sm leading-6 text-slate-700">
          {status === 'loading' ? 'Verifying your email…' : message}
        </div>
        {status !== 'loading' && (
          <div className="mt-6">
            <Link to="/login" className="rounded-xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800">
              Go to sign in
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
