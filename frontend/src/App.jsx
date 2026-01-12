
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from './redux/slices/authSlice'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import { useState, useRef, useEffect } from 'react'

function App() {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const { user } = useSelector(state => state.auth)

  const [profileOpen, setProfileOpen] = useState(false)
  const profileRef = useRef(null)

  const handleLogin = () => navigate('/auth?mode=login')
  const handleSignup = () => navigate('/auth?mode=signup')

  const handleLogout = () => {
    dispatch(logout())
    setProfileOpen(false)
    navigate('/auth?mode=login')
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">

      {/* 🔥 NAVBAR */}
      <nav className="bg-white shadow-2xl border-b border-gray-200 sticky top-0 z-50 h-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">

            <h1
              onClick={() => navigate('/')}
              className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-transform"
            >
              🚀 GigFlow
            </h1>

            <div className="flex items-center space-x-2">
              {user ? (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setProfileOpen(!profileOpen)}
                    className="hidden md:flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl font-semibold shadow-md hover:scale-105 transition"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <span>{user?.name || 'User'}</span>
                    <svg className={`w-4 h-4 transition-transform ${profileOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border py-2">
                      <div className="px-6 py-4 border-b">
                        <h3 className="font-bold">{user?.name || 'User'}</h3>
                        <p className="text-sm text-gray-500 break-words max-w-full">
                               {user?.email}
                        </p>               
                      </div>
                      <button
                        onClick={handleLogout}
                        className="w-full px-6 py-3 text-left text-sm hover:bg-red-50 hover:text-red-600"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <button
                    onClick={handleLogin}
                    className="hidden sm:block px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
                  >
                    Login
                  </button>
                  <button
                    onClick={handleSignup}
                    className="px-6 py-2 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600"
                  >
                    Sign Up
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </nav>

      {/* ✅ CONTENT */}
      <main className="pt-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={user ? <Dashboard /> : <Navigate to="/auth?mode=login" />} />
          <Route path="/auth" element={!user ? <Auth /> : <Navigate to="/" />} />
          <Route path="*" element={<Navigate to={user ? "/" : "/auth"} />} />
        </Routes>
      </main>

    </div>
  )
}

export default App
