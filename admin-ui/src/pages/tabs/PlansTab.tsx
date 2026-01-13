import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../api/client'
import type { Plan } from '../../api/client'

function PlansTab() {
  const { appId: appIdParam } = useParams<{ appId: string }>()
  const appId = parseInt(appIdParam!)
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Modal states
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Plan | null>(null)
  const [saving, setSaving] = useState(false)

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price_cents: 0,
    currency: 'usd',
    billing_interval: 'monthly' as 'monthly' | 'yearly' | 'lifetime',
    stripe_price_id: '',
    features: '',
    is_default: false,
  })

  useEffect(() => {
    loadPlans()
  }, [appId])

  const loadPlans = async () => {
    try {
      const data = await api.getPlans(appId)
      setPlans(data)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  const openCreateModal = () => {
    setFormData({
      name: '',
      slug: '',
      description: '',
      price_cents: 0,
      currency: 'usd',
      billing_interval: 'monthly',
      stripe_price_id: '',
      features: '',
      is_default: false,
    })
    setEditingPlan(null)
    setShowModal(true)
  }

  const openEditModal = (plan: Plan) => {
    setEditingPlan(plan)
    setFormData({
      name: plan.name,
      slug: plan.slug || '',
      description: plan.description || '',
      price_cents: plan.price_cents,
      currency: plan.currency || 'usd',
      billing_interval: plan.billing_interval || 'monthly',
      stripe_price_id: plan.stripe_price_id || '',
      features: plan.features || '',
      is_default: plan.is_default || false,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingPlan(null)
  }

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: editingPlan ? formData.slug : generateSlug(name),
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (editingPlan) {
        await api.updatePlan(appId, editingPlan.id, {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          price_cents: formData.price_cents,
          currency: formData.currency,
          billing_interval: formData.billing_interval,
          stripe_price_id: formData.stripe_price_id || null,
          features: formData.features || null,
          is_default: formData.is_default,
        })
      } else {
        await api.createPlan(appId, {
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          price_cents: formData.price_cents,
          currency: formData.currency,
          billing_interval: formData.billing_interval,
          stripe_price_id: formData.stripe_price_id || null,
          features: formData.features || null,
          is_default: formData.is_default,
        })
      }
      closeModal()
      loadPlans()
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  const handleToggleActive = async (plan: Plan) => {
    try {
      await api.updatePlan(appId, plan.id, { is_active: !plan.is_active })
      loadPlans()
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return

    try {
      await api.deletePlan(appId, deleteConfirm.id)
      setDeleteConfirm(null)
      loadPlans()
    } catch (err) {
      alert('Error: ' + (err as Error).message)
    }
  }

  const formatPrice = (cents: number, currency: string) => {
    const amount = cents / 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  }

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading plans...</div>
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">Error: {error}</div>
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Subscription Plans</h2>
        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
        >
          + Add Plan
        </button>
      </div>

      {/* Plans Table */}
      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interval</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Default</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {plans.map(plan => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{plan.name}</div>
                      <div className="text-xs text-gray-500">{plan.slug}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${plan.price_cents > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {plan.price_cents > 0 ? formatPrice(plan.price_cents, plan.currency || 'usd') : 'Free'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-600 capitalize">{plan.billing_interval}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleToggleActive(plan)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        plan.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {plan.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {plan.is_default && (
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        Default
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => openEditModal(plan)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(plan)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {plans.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    No plans yet. Create one to get started.
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
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingPlan ? 'Edit Plan' : 'Create Plan'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="e.g., Pro Plan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                    <input
                      type="text"
                      required
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      placeholder="e.g., pro-plan"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this plan"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price (cents)</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.price_cents}
                      onChange={(e) => setFormData({ ...formData, price_cents: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      = {formatPrice(formData.price_cents, formData.currency)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="usd">USD</option>
                      <option value="sgd">SGD</option>
                      <option value="cny">CNY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                    <select
                      value={formData.billing_interval}
                      onChange={(e) => setFormData({ ...formData, billing_interval: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                      <option value="lifetime">Lifetime</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stripe Price ID</label>
                  <input
                    type="text"
                    value={formData.stripe_price_id}
                    onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
                    placeholder="price_xxxxx"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Features (JSON)</label>
                  <textarea
                    rows={3}
                    value={formData.features}
                    onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                    placeholder='["Feature 1", "Feature 2", "Feature 3"]'
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_default"
                    checked={formData.is_default}
                    onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_default" className="ml-2 text-sm text-gray-700">
                    Set as default plan for new users
                  </label>
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
                  {saving ? 'Saving...' : editingPlan ? 'Update' : 'Create'}
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
              <h3 className="text-lg font-semibold text-gray-900">Delete Plan</h3>
            </div>
            <div className="px-6 py-4">
              <p className="text-gray-600">
                Are you sure you want to delete the plan <strong>{deleteConfirm.name}</strong>? Users on this plan may be affected.
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

export default PlansTab
