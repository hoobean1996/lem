/**
 * Assignment Form Modal
 *
 * Modal for creating or editing an assignment.
 * Now uses local TypeScript adventures instead of API.
 */

import { useState, useEffect, useMemo } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import { classroomApi, AssignmentResponse, ApiError } from '../../../../infrastructure/services/api';
import { loadLocalAdventures } from '../../../../infrastructure/levels';
import { error as logError } from '../../../../infrastructure/logging';

interface AssignmentFormModalProps {
  classroomId: number;
  assignment?: AssignmentResponse;
  onClose: () => void;
  onCreated?: (assignment: AssignmentResponse) => void;
  onUpdated?: (assignment: AssignmentResponse) => void;
}

export default function AssignmentFormModal({
  classroomId,
  assignment,
  onClose,
  onCreated,
  onUpdated,
}: AssignmentFormModalProps) {
  const isEditing = !!assignment;

  const [title, setTitle] = useState(assignment?.title || '');
  const [description, setDescription] = useState('');
  const [selectedAdventureId, setSelectedAdventureId] = useState<string | null>(null);
  const [selectedLevelIds, setSelectedLevelIds] = useState<string[]>([]);
  const [dueDays, setDueDays] = useState<number>(3);
  const [maxPoints, setMaxPoints] = useState(100);

  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load local adventures (synchronous)
  const adventures = useMemo(() => loadLocalAdventures().adventures, []);

  // Get selected adventure
  const selectedAdventure = useMemo(
    () => adventures.find((a) => a.id === selectedAdventureId),
    [adventures, selectedAdventureId]
  );

  // Load assignment details if editing
  useEffect(() => {
    async function loadDetails() {
      if (!assignment) return;
      try {
        setLoadingDetails(true);
        const details = await classroomApi.getAssignment(classroomId, assignment.id);
        setDescription(details.description || '');
        // level_ids are now stored as "adventure_slug/level_slug" strings
        // Cast to string[] since SDK types are incorrect
        const levelIds = (details.level_ids as unknown as string[]) || [];
        if (levelIds.length > 0) {
          // Extract adventure ID from first level
          const firstLevelId = levelIds[0];
          if (typeof firstLevelId === 'string' && firstLevelId.includes('/')) {
            const [advId] = firstLevelId.split('/');
            setSelectedAdventureId(advId);
          }
          setSelectedLevelIds(levelIds);
        }
        setMaxPoints(details.max_points);
        if (details.due_date) {
          const dueDate = new Date(details.due_date);
          const now = new Date();
          const diffTime = dueDate.getTime() - now.getTime();
          const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
          setDueDays(diffDays);
        }
      } catch (err) {
        logError(
          'Failed to load assignment details',
          err,
          { assignmentId: assignment?.id },
          'AssignmentFormModal'
        );
      } finally {
        setLoadingDetails(false);
      }
    }
    loadDetails();
  }, [assignment, classroomId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (!selectedAdventureId) {
      setError('Please select an adventure');
      return;
    }

    if (selectedLevelIds.length === 0) {
      setError('Please select at least one level');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Calculate due date from days
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + dueDays);
      dueDate.setHours(23, 59, 59, 0); // Set to end of day

      const data = {
        title: title.trim(),
        description: description.trim() || null,
        level_ids: selectedLevelIds, // Stored as "adventure_slug/level_slug"
        due_date: dueDate.toISOString(),
        max_points: maxPoints,
      };

      if (isEditing) {
        const updated = await classroomApi.updateAssignment(classroomId, assignment.id, data);
        onUpdated?.(updated);
      } else {
        const created = await classroomApi.createAssignment(classroomId, data);
        onCreated?.(created);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError('Failed to save assignment');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4a7a2a]" />
            <h2 className="text-lg font-bold text-gray-800">
              {isEditing ? 'Edit Assignment' : 'Create Assignment'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-[#4a7a2a]" />
            </div>
          ) : (
            <>
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Week 1: Introduction to Loops"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7a2a] focus:border-[#4a7a2a] outline-none"
                  maxLength={200}
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Instructions for students..."
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7a2a] focus:border-[#4a7a2a] outline-none resize-none"
                  rows={2}
                />
              </div>

              {/* Adventure Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adventure *</label>
                <select
                  value={selectedAdventureId || ''}
                  onChange={(e) => {
                    setSelectedAdventureId(e.target.value || null);
                    setSelectedLevelIds([]); // Reset level selection
                  }}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7a2a] focus:border-[#4a7a2a] outline-none"
                >
                  <option value="">Select an adventure...</option>
                  {adventures.map((adv) => (
                    <option key={adv.id} value={adv.id}>
                      {adv.icon} {adv.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Selection */}
              {selectedAdventure && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Levels * ({selectedLevelIds.length} selected)
                  </label>
                  <div className="border border-gray-300 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2">
                    {selectedAdventure.levels.map((level) => {
                      const levelId = `${selectedAdventure.id}/${level.id}`;
                      const isSelected = selectedLevelIds.includes(levelId);
                      return (
                        <label
                          key={level.id}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#e8f5e0]' : 'hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedLevelIds([...selectedLevelIds, levelId]);
                              } else {
                                setSelectedLevelIds(selectedLevelIds.filter((id) => id !== levelId));
                              }
                            }}
                            className="w-4 h-4 text-[#4a7a2a] rounded focus:ring-[#4a7a2a]"
                          />
                          <div>
                            <div className="font-medium text-gray-800">{level.name}</div>
                            {level.description && (
                              <div className="text-sm text-gray-500">{level.description}</div>
                            )}
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Due Date & Max Points */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Due in (days)
                  </label>
                  <input
                    type="number"
                    value={dueDays}
                    onChange={(e) => setDueDays(Math.max(1, parseInt(e.target.value) || 1))}
                    min={1}
                    max={365}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7a2a] focus:border-[#4a7a2a] outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Max Points</label>
                  <input
                    type="number"
                    value={maxPoints}
                    onChange={(e) => setMaxPoints(parseInt(e.target.value) || 100)}
                    min={1}
                    max={1000}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7a2a] focus:border-[#4a7a2a] outline-none"
                  />
                </div>
              </div>
            </>
          )}
        </form>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || loadingDetails}
            className="flex-1 py-2.5 bg-[#4a7a2a] text-white rounded-xl font-medium hover:bg-[#3a6a1a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                {isEditing ? 'Saving...' : 'Creating...'}
              </>
            ) : isEditing ? (
              'Save Changes'
            ) : (
              'Create Assignment'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
