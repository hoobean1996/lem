import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api/client'
import type { EmailTemplate, EmailTemplateDetail } from '../../api/client'

function EmailTemplatesTab() {
  const { appId: appIdParam } = useParams<{ appId: string }>()
  const appId = parseInt(appIdParam!)
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplateDetail | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<EmailTemplate | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    subject: '',
    body_html: '',
    body_text: '',
    variables: '',
  })

  useEffect(() => {
    loadTemplates()
  }, [appId])

  const loadTemplates = async () => {
    try {
      const data = await api.getEmailTemplates(appId)
      setTemplates(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const openCreateModal = () => {
    setFormData({
      name: '',
      description: '',
      subject: '',
      body_html: '',
      body_text: '',
      variables: '',
    })
    setEditingTemplate(null)
    setShowModal(true)
  }

  const openEditModal = async (template: EmailTemplate) => {
    try {
      const detail = await api.getEmailTemplate(appId, template.id)
      setEditingTemplate(detail)
      setFormData({
        name: detail.name,
        description: detail.description || '',
        subject: detail.subject,
        body_html: detail.body_html,
        body_text: detail.body_text || '',
        variables: detail.variables?.join(', ') || '',
      })
      setShowModal(true)
    } catch (err) {
      alert('Error loading template: ' + (err as Error).message)
    }
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingTemplate(null)
    setFormData({
      name: '',
      description: '',
      subject: '',
      body_html: '',
      body_text: '',
      variables: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const variables = formData.variables
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0)

    try {
      if (editingTemplate) {
        await api.updateEmailTemplate(appId, editingTemplate.id, {
          description: formData.description || null,
          subject: formData.subject,
          body_html: formData.body_html,
          body_text: formData.body_text || null,
          variables: variables.length > 0 ? variables : null,
        })
      } else {
        await api.createEmailTemplate(appId, {
          name: formData.name,
          description: formData.description || null,
          subject: formData.subject,
          body_html: formData.body_html,
          body_text: formData.body_text || null,
          variables: variables.length > 0 ? variables : null,
        })
      }
      closeModal()
      loadTemplates()
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      await api.deleteEmailTemplate(appId, deleteConfirm.id)
      setDeleteConfirm(null)
      loadTemplates()
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading templates...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + Add Template
        </button>
      </div>

      {/* Templates Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variables</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {templates.map(template => (
                <tr key={template.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">{template.name}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{template.subject}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-500">{template.description || '-'}</span>
                  </td>
                  <td className="px-6 py-4">
                    {template.variables && template.variables.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map(v => (
                          <span key={v} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">
                            {`{{${v}}}`}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(template)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(template)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {templates.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No email templates yet. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTemplate ? 'Edit Template' : 'Create Template'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingTemplate}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., welcome, password-reset"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                  />
                  {!editingTemplate && (
                    <p className="text-xs text-gray-500 mt-1">Template name cannot be changed after creation</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of when this template is used"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Email subject line"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HTML Body *</label>
                  <textarea
                    required
                    rows={8}
                    value={formData.body_html}
                    onChange={(e) => setFormData({ ...formData, body_html: e.target.value })}
                    placeholder="<p>Hello {{recipient_name}},</p>"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plain Text Body</label>
                  <textarea
                    rows={4}
                    value={formData.body_text}
                    onChange={(e) => setFormData({ ...formData, body_text: e.target.value })}
                    placeholder="Hello {{recipient_name}},"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Variables</label>
                  <input
                    type="text"
                    value={formData.variables}
                    onChange={(e) => setFormData({ ...formData, variables: e.target.value })}
                    placeholder="recipient_name, company_name, link"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Comma-separated list of variable names used in the template</p>
                </div>
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : editingTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="px-6 py-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Delete Template</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">
                Are you sure you want to delete the template <strong>{deleteConfirm.name}</strong>? This action cannot be undone.
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

export default EmailTemplatesTab
