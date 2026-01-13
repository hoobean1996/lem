/**
 * Classroom Settings Modal
 *
 * Modal for editing classroom settings.
 */

import { useState } from 'react';
import { X, Settings, Loader2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { classroomApi, ClassroomResponse, ApiError } from '../../../../infrastructure/services/api';

interface ClassroomSettingsModalProps {
  classroom: ClassroomResponse;
  onClose: () => void;
  onUpdated: (classroom: ClassroomResponse) => void;
}

export default function ClassroomSettingsModal({
  classroom,
  onClose,
  onUpdated,
}: ClassroomSettingsModalProps) {
  const navigate = useNavigate();

  const [name, setName] = useState(classroom.name);
  const [description, setDescription] = useState(classroom.description || '');
  const [allowJoin, setAllowJoin] = useState(classroom.allow_join);
  const [isActive, setIsActive] = useState(classroom.is_active);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError('Class name is required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updated = await classroomApi.update(classroom.id, {
        name: name.trim(),
        description: description.trim() || undefined,
        allow_join: allowJoin,
        is_active: isActive,
      });

      onUpdated(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError('Failed to update classroom');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        `Are you sure you want to delete "${classroom.name}"? This will remove all members and assignments. This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      setDeleting(true);
      await classroomApi.delete(classroom.id);
      navigate('/t/classes');
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.detail || 'Failed to delete classroom');
      }
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#4a7a2a]" />
            <h2 className="text-lg font-bold text-gray-800">Class Settings</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7a2a] focus:border-[#4a7a2a] outline-none"
              maxLength={200}
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7a2a] focus:border-[#4a7a2a] outline-none resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
              <div>
                <div className="font-medium text-gray-800">Allow Joining</div>
                <div className="text-sm text-gray-600">Students can join using the join code</div>
              </div>
              <input
                type="checkbox"
                checked={allowJoin}
                onChange={(e) => setAllowJoin(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#4a7a2a] focus:ring-[#4a7a2a]"
              />
            </label>

            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-xl cursor-pointer">
              <div>
                <div className="font-medium text-gray-800">Active</div>
                <div className="text-sm text-gray-600">Show this classroom to students</div>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-5 h-5 rounded border-gray-300 text-[#4a7a2a] focus:ring-[#4a7a2a]"
              />
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 py-2.5 bg-[#4a7a2a] text-white rounded-xl font-medium hover:bg-[#3a6a1a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="text-sm font-medium text-gray-700 mb-2">Danger Zone</div>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="w-full py-2.5 border border-red-300 text-red-600 rounded-xl font-medium hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Classroom
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
