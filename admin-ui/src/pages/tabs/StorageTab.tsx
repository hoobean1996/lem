import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api/client'
import type { StorageFile } from '../../api/client'

function StorageTab() {
  const { appId: appIdParam } = useParams<{ appId: string }>()
  const appId = parseInt(appIdParam!)
  const [files, setFiles] = useState<StorageFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [folder, setFolder] = useState('shared')
  const [uploading, setUploading] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<StorageFile | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadFiles()
  }, [appId, folder])

  const loadFiles = async () => {
    setLoading(true)
    try {
      const data = await api.getStorageFiles(appId, folder)
      setFiles(data)
      setError(null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    try {
      await api.uploadFile(appId, file, folder)
      loadFiles()
    } catch (err) {
      alert('Error uploading file: ' + (err as Error).message)
    } finally {
      setUploading(false)
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDownload = async (file: StorageFile) => {
    try {
      const { url } = await api.getSignedUrl(appId, file.path)
      window.open(url, '_blank')
    } catch (err) {
      alert('Error getting download URL: ' + (err as Error).message)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      await api.deleteStorageFile(appId, deleteConfirm.path)
      setDeleteConfirm(null)
      loadFiles()
    } catch (err) {
      alert('Error deleting file: ' + (err as Error).message)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (contentType: string | null) => {
    if (!contentType) return '📄'
    if (contentType.startsWith('image/')) return '🖼️'
    if (contentType.startsWith('video/')) return '🎬'
    if (contentType.startsWith('audio/')) return '🎵'
    if (contentType === 'application/pdf') return '📕'
    if (contentType.includes('json')) return '📋'
    if (contentType.includes('zip') || contentType.includes('tar') || contentType.includes('gz')) return '📦'
    return '📄'
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Storage</h2>
          <select
            value={folder}
            onChange={(e) => setFolder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="shared">shared</option>
            <option value="config">config</option>
            <option value="uploads">uploads</option>
          </select>
        </div>
        <div>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleUpload}
            className="hidden"
            id="file-upload"
          />
          <label
            htmlFor="file-upload"
            className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm cursor-pointer inline-block ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {uploading ? 'Uploading...' : '+ Upload File'}
          </label>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-lg shadow">
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading files...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>Error: {error}</p>
            <p className="text-sm mt-2">Storage may not be configured for this app.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {files.map(file => (
                  <tr key={file.path} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-xl mr-3">{getFileIcon(file.content_type)}</span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{file.filename}</div>
                          <div className="text-xs text-gray-500 font-mono">{file.path}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600">{formatFileSize(file.size)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-500">{file.content_type || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {file.created ? new Date(file.created).toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleDownload(file)}
                        className="text-blue-600 hover:text-blue-800 mr-3"
                      >
                        Download
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(file)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {files.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      No files in this folder. Upload a file to get started.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Delete File</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">
                Are you sure you want to delete <strong>{deleteConfirm.filename}</strong>? This action cannot be undone.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StorageTab
