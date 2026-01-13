import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api/client'
import type { App } from '../api/client'

function AppsPage() {
  const [apps, setApps] = useState<App[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api.getApps()
      .then(setApps)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading apps...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Apps</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map(app => (
          <Link
            key={app.id}
            to={`/apps/${app.id}`}
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">{app.name[0]}</span>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{app.name}</h2>
                <p className="text-sm text-gray-500">{app.slug}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {apps.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No apps found.
        </div>
      )}
    </div>
  )
}

export default AppsPage
