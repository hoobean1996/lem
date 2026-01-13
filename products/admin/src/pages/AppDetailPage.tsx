import { useEffect, useState } from 'react'
import { useParams, Link, NavLink, Outlet } from 'react-router-dom'
import { api } from '../api/client'
import type { App } from '../api/client'

type TabConfig = { path: string; label: string }

const baseTabs: TabConfig[] = [
  { path: 'users', label: 'Users' },
  { path: 'emails', label: 'Email Templates' },
  { path: 'plans', label: 'Plans' },
  { path: 'orgs', label: 'Organizations' },
  { path: 'storage', label: 'Storage' },
]

function AppDetailPage() {
  const { appId } = useParams<{ appId: string }>()
  const [app, setApp] = useState<App | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!appId) return

    api.getApp(parseInt(appId))
      .then(setApp)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [appId])

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>
  }

  const tabs = baseTabs

  return (
    <div>
      {/* Back link */}
      <Link to="/" className="text-blue-600 hover:text-blue-800 text-sm mb-4 inline-block">
        &larr; Back to Apps
      </Link>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{app?.name}</h1>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              className={({ isActive }) =>
                `py-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Tab Content - Rendered by nested route */}
      <Outlet />
    </div>
  )
}

export default AppDetailPage
