// pages/Auth.jsx - ✅ FIXED EMAIL BUG
import { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { loginUser, registerUser } from '../redux/slices/authSlice'

export default function Auth() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user, loading, error } = useSelector((state) => state.auth)
  const [searchParams] = useSearchParams()
  
  const mode = searchParams.get('mode') === 'signup' ? 'signup' : 'login'
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  })

  useEffect(() => {
    if (user) {
      navigate('/')
    }
  }, [user, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (mode === 'login') {
      await dispatch(loginUser({ email: formData.email, password: formData.password }))
    } else {
      await dispatch(registerUser(formData))
    }
  }

  const switchMode = () => {
    if (mode === 'login') {
      navigate('/auth?mode=signup')
    } else {
      navigate('/auth')
    }
  }

  // ✅ FIXED: Email onChange was setting BOTH name AND email
  const handleEmailChange = (e) => {
    setFormData({ ...formData, email: e.target.value })
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-2xl border border-gray-200">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            {mode === 'login' ? 'Welcome Back' : 'Join GigFlow'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {mode === 'login' 
              ? 'Sign in to continue to your gigs' 
              : 'Create your freelancer account'
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-xl">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <form className="space-y-6" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                required
                placeholder="John Doe"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleEmailChange}  // ✅ FIXED
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-300 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-xl font-bold shadow-xl hover:shadow-2xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                <span>{mode === 'login' ? 'Signing in...' : 'Creating...'}</span>
              </>
            ) : (
              mode === 'login' ? 'Sign In' : 'Sign Up'
            )}
          </button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={switchMode}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {mode === 'login' 
              ? "Don't have an account? Create one" 
              : "Already have an account? Sign in"
            }
          </button>
        </div>
      </div>
    </div>
  )
}
