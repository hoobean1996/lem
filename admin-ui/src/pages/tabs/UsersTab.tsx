import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { createPortal } from 'react-dom'
import { api } from '../../api/client'
import type { AppUser, EmailTemplate } from '../../api/client'

function UsersTab() {
  const { appId: appIdParam } = useParams<{ appId: string }>()
  const appId = parseInt(appIdParam!)
  const [users, setUsers] = useState<AppUser[]>([])
  const [isShenbiApp, setIsShenbiApp] = useState(false)
  const [activeCount, setActiveCount] = useState(0)
  const [paidCount, setPaidCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [tokenModal, setTokenModal] = useState<{ email: string; accessToken: string; refreshToken: string; expiresIn: number } | null>(null)
  const [emailModal, setEmailModal] = useState<{ userId: number; email: string; name: string } | null>(null)
  const [emailMode, setEmailMode] = useState<'template' | 'custom'>('template')
  const [emailTemplates, setEmailTemplates] = useState<EmailTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null)
  const [templateVariables, setTemplateVariables] = useState<Record<string, string>>({})
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [sending, setSending] = useState(false)

  // Dropdown state
  const [openDropdown, setOpenDropdown] = useState<number | null>(null)
  const [dropdownPos, setDropdownPos] = useState<{ top: number; left: number } | null>(null)
  const buttonRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  useEffect(() => {
    Promise.all([
      api.getAppUsers(appId),
      api.getEmailTemplates(appId),
    ])
      .then(([usersData, templates]) => {
        setUsers(usersData.users)
        setIsShenbiApp(usersData.is_shenbi_app)
        setActiveCount(usersData.active_count)
        setPaidCount(usersData.paid_count)
        setEmailTemplates(templates)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [appId])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => {
      setOpenDropdown(null)
      setDropdownPos(null)
    }
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [])

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      await api.updateShenbiRole(appId, userId, newRole)
      setUsers(users.map(u =>
        u.user.id === userId
          ? { ...u, shenbi_profile: u.shenbi_profile ? { ...u.shenbi_profile, role: newRole } : null }
          : u
      ))
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    }
  }

  const handleGenerateToken = async (userId: number, email: string) => {
    setOpenDropdown(null)
    try {
      const data = await api.generateToken(appId, userId)
      setTokenModal({
        email,
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
      })
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    }
  }

  const handleResetProgress = async (userId: number, email: string) => {
    setOpenDropdown(null)
    if (!confirm(`Are you sure you want to reset all progress for ${email}? This will delete all level completions, stars, and achievements. This action cannot be undone.`)) {
      return
    }
    try {
      const data = await api.resetProgress(appId, userId)
      alert(`Progress reset successfully!\n\nDeleted:\n- ${data.progress_deleted} level progress records\n- ${data.achievements_deleted} achievements`)
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    }
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!emailModal) return

    setSending(true)
    try {
      if (emailMode === 'template' && selectedTemplate) {
        await api.sendTemplateEmail(appId, emailModal.userId, selectedTemplate.name, templateVariables)
      } else {
        await api.sendEmail(appId, emailModal.userId, emailSubject, emailBody)
      }
      alert('Email sent successfully!')
      closeEmailModal()
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    } finally {
      setSending(false)
    }
  }

  const openEmailModal = (userId: number, email: string, name: string) => {
    setOpenDropdown(null)
    setEmailModal({ userId, email, name })
    setEmailMode(emailTemplates.length > 0 ? 'template' : 'custom')
    setSelectedTemplate(emailTemplates.length > 0 ? emailTemplates[0] : null)
    if (emailTemplates.length > 0 && emailTemplates[0].variables) {
      const vars: Record<string, string> = {}
      emailTemplates[0].variables.forEach(v => {
        if (v === 'recipient_name' && name) vars[v] = name
        else vars[v] = ''
      })
      setTemplateVariables(vars)
    }
  }

  const closeEmailModal = () => {
    setEmailModal(null)
    setSelectedTemplate(null)
    setTemplateVariables({})
    setEmailSubject('')
    setEmailBody('')
  }

  const handleTemplateChange = (templateName: string) => {
    const template = emailTemplates.find(t => t.name === templateName)
    setSelectedTemplate(template || null)
    if (template?.variables) {
      const vars: Record<string, string> = {}
      template.variables.forEach(v => {
        if (v === 'recipient_name' && emailModal?.name) vars[v] = emailModal.name
        else vars[v] = templateVariables[v] || ''
      })
      setTemplateVariables(vars)
    }
  }

  const copyToClipboard = (text: string, button: HTMLButtonElement) => {
    navigator.clipboard.writeText(text)
    const originalText = button.textContent
    button.textContent = 'Copied!'
    button.classList.add('bg-green-200')
    setTimeout(() => {
      button.textContent = originalText
      button.classList.remove('bg-green-200')
    }, 1500)
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'teacher': return 'bg-purple-100 text-purple-800'
      default: return 'bg-blue-100 text-blue-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'trialing': return 'bg-blue-100 text-blue-800'
      case 'canceled': return 'bg-red-100 text-red-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading users...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>
  }

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-gray-900">{users.length}</div>
          <div className="text-sm text-gray-500">Total Users</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-green-600">{activeCount}</div>
          <div className="text-sm text-gray-500">Active Subscriptions</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-2xl font-bold text-blue-600">{paidCount}</div>
          <div className="text-sm text-gray-500">Paid Users</div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                {isShenbiApp && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Shenbi Profile</th>
                )}
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {users.map(item => (
                <tr key={item.user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">{item.user.email[0].toUpperCase()}</span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.user.name || 'No name'}</div>
                        <div className="text-sm text-gray-500">{item.user.email}</div>
                      </div>
                    </div>
                  </td>

                  {isShenbiApp && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      {item.shenbi_profile ? (
                        <div className="text-sm">
                          <select
                            value={item.shenbi_profile.role}
                            onChange={(e) => handleRoleChange(item.user.id, e.target.value)}
                            className={`px-2 py-1 text-xs rounded-full border-0 cursor-pointer ${getRoleColor(item.shenbi_profile.role)}`}
                          >
                            <option value="student">student</option>
                            <option value="teacher">teacher</option>
                            <option value="admin">admin</option>
                          </select>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-sm">No profile</span>
                      )}
                    </td>
                  )}

                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.subscription?.plan ? (
                      <span className={`px-2 py-1 text-xs rounded-full ${item.subscription.plan.price_cents > 0 ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                        {item.subscription.plan.name}
                      </span>
                    ) : (
                      <span className="text-gray-400 text-sm">No subscription</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    {item.subscription ? (
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.subscription.status)}`}>
                        {item.subscription.status}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.user_app.enabled_at).toLocaleDateString()}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.user.last_login_at
                      ? new Date(item.user.last_login_at).toLocaleString()
                      : 'Never'}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      ref={(el) => {
                        if (el) buttonRefs.current.set(item.user.id, el)
                      }}
                      onClick={(e) => {
                        e.stopPropagation()
                        if (openDropdown === item.user.id) {
                          setOpenDropdown(null)
                          setDropdownPos(null)
                        } else {
                          const rect = e.currentTarget.getBoundingClientRect()
                          setDropdownPos({
                            top: rect.bottom + 4,
                            left: rect.right - 160, // 160px is dropdown width (w-40)
                          })
                          setOpenDropdown(item.user.id)
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded-full"
                    >
                      <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={isShenbiApp ? 7 : 6} className="px-6 py-12 text-center text-gray-500">
                    No users yet for this app.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions Dropdown Portal */}
      {openDropdown !== null && dropdownPos && createPortal(
        <div
          className="fixed w-40 bg-white rounded-lg shadow-lg border z-[9999]"
          style={{ top: dropdownPos.top, left: dropdownPos.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => {
              const user = users.find(u => u.user.id === openDropdown)
              if (user) handleGenerateToken(user.user.id, user.user.email)
            }}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-t-lg"
          >
            Generate JWT
          </button>
          {isShenbiApp && (
            <button
              onClick={() => {
                const user = users.find(u => u.user.id === openDropdown)
                if (user) handleResetProgress(user.user.id, user.user.email)
              }}
              className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
            >
              Reset Progress
            </button>
          )}
          <button
            onClick={() => {
              const user = users.find(u => u.user.id === openDropdown)
              if (user) openEmailModal(user.user.id, user.user.email, user.user.name || '')
            }}
            className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 rounded-b-lg"
          >
            Send Email
          </button>
        </div>,
        document.body
      )}

      {/* Token Modal */}
      {tokenModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Generated JWT Token</h3>
              <button onClick={() => setTokenModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="px-6 py-4">
              <p className="text-sm text-gray-600 mb-2">User: <span className="font-medium">{tokenModal.email}</span></p>
              <p className="text-sm text-gray-600 mb-4">Expires in: <span className="font-medium">{Math.floor(tokenModal.expiresIn / 60)} minutes</span></p>

              <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
              <div className="relative mb-4">
                <textarea
                  readOnly
                  rows={4}
                  value={tokenModal.accessToken}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs bg-gray-50"
                />
                <button
                  onClick={(e) => copyToClipboard(tokenModal.accessToken, e.currentTarget)}
                  className="absolute top-2 right-2 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs"
                >
                  Copy
                </button>
              </div>

              <label className="block text-sm font-medium text-gray-700 mb-1">Refresh Token</label>
              <div className="relative">
                <textarea
                  readOnly
                  rows={3}
                  value={tokenModal.refreshToken}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-xs bg-gray-50"
                />
                <button
                  onClick={(e) => copyToClipboard(tokenModal.refreshToken, e.currentTarget)}
                  className="absolute top-2 right-2 px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded text-xs"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t flex justify-end">
              <button onClick={() => setTokenModal(null)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal */}
      {emailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">Send Email</h3>
              <button onClick={closeEmailModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Mode Tabs */}
            <div className="px-6 pt-4 flex border-b">
              <button
                type="button"
                onClick={() => setEmailMode('template')}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  emailMode === 'template'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Use Template
              </button>
              <button
                type="button"
                onClick={() => setEmailMode('custom')}
                className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${
                  emailMode === 'custom'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Custom Email
              </button>
            </div>

            <form onSubmit={handleSendEmail}>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    type="text"
                    readOnly
                    value={emailModal.name ? `${emailModal.name} <${emailModal.email}>` : emailModal.email}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                  />
                </div>

                {emailMode === 'template' ? (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Template</label>
                      {emailTemplates.length > 0 ? (
                        <select
                          value={selectedTemplate?.name || ''}
                          onChange={(e) => handleTemplateChange(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                          {emailTemplates.map(t => (
                            <option key={t.id} value={t.name}>{t.name} - {t.subject}</option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-gray-500 italic">No templates available. Create one in Email Templates tab.</p>
                      )}
                    </div>

                    {selectedTemplate?.description && (
                      <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded">{selectedTemplate.description}</p>
                    )}

                    {selectedTemplate?.variables && selectedTemplate.variables.length > 0 && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">Variables</label>
                        {selectedTemplate.variables.map(varName => (
                          <div key={varName}>
                            <label className="block text-xs text-gray-500 mb-1">{`{{${varName}}}`}</label>
                            <input
                              type="text"
                              value={templateVariables[varName] || ''}
                              onChange={(e) => setTemplateVariables({ ...templateVariables, [varName]: e.target.value })}
                              placeholder={varName}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
                      <input
                        type="text"
                        required
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                      <textarea
                        rows={6}
                        required
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="px-6 py-4 bg-gray-50 border-t flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeEmailModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sending || (emailMode === 'template' && !selectedTemplate)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {sending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default UsersTab
