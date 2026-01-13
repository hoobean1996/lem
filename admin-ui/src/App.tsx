import { useEffect, useState } from 'react'
import { Outlet, useNavigate, Link } from 'react-router-dom'
import { api } from './api/client'
import type { AdminUser } from './api/client'

function App() {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.getAdminUser()
      .then(user => {
        if (!user) {
          navigate('/login')
        } else {
          setAdmin(user)
        }
      })
      .catch(() => navigate('/login'))
      .finally(() => setLoading(false))
  }, [navigate])

  const handleLogout = async () => {
    try {
      await api.logout()
      navigate('/login')
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl">🍋</span>
              <span className="text-xl font-semibold text-gray-900">Lemonade Admin</span>
              <span className="text-xs text-gray-400 font-mono">v{__GIT_COMMIT__}</span>
            </Link>
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">Apps</Link>
              {admin && (
                <>
                  <span className="text-gray-600">{admin.email}</span>
                  <button
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  )
}

export default App
