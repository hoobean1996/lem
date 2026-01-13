/**
 * Assignment List Component
 *
 * Displays and manages classroom assignments.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Plus,
  Pencil,
  Trash2,
  Send,
  Loader2,
  Calendar,
  BarChart3,
} from 'lucide-react';
import {
  classroomApi,
  AssignmentResponse,
  ApiError,
} from '../../../../infrastructure/services/api';
import AssignmentFormModal from './AssignmentFormModal';

interface AssignmentListProps {
  classroomId: number;
  onAssignmentCountChange?: (count: number) => void;
}

export default function AssignmentList({
  classroomId,
  onAssignmentCountChange,
}: AssignmentListProps) {
  const navigate = useNavigate();
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentResponse | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [publishingId, setPublishingId] = useState<number | null>(null);

  const loadAssignments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classroomApi.listAssignments(classroomId, true);
      setAssignments(response);
      onAssignmentCountChange?.(response.length);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError('Failed to load assignments');
      }
    } finally {
      setLoading(false);
    }
  }, [classroomId, onAssignmentCountChange]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  const handleDelete = async (assignment: AssignmentResponse) => {
    if (!confirm(`Delete "${assignment.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(assignment.id);
      await classroomApi.deleteAssignment(classroomId, assignment.id);
      setAssignments((prev) => prev.filter((a) => a.id !== assignment.id));
      onAssignmentCountChange?.(assignments.length - 1);
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.detail || 'Failed to delete assignment');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handlePublish = async (assignment: AssignmentResponse) => {
    if (!confirm(`Publish "${assignment.title}"? Students will be able to see and work on it.`)) {
      return;
    }

    try {
      setPublishingId(assignment.id);
      const updated = await classroomApi.publishAssignment(classroomId, assignment.id);
      setAssignments((prev) =>
        prev.map((a) => (a.id === assignment.id ? { ...a, status: updated.status } : a))
      );
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.detail || 'Failed to publish assignment');
      }
    } finally {
      setPublishingId(null);
    }
  };

  const handleAssignmentCreated = (assignment: AssignmentResponse) => {
    setAssignments((prev) => [assignment, ...prev]);
    setShowCreateModal(false);
    onAssignmentCountChange?.(assignments.length + 1);
  };

  const handleAssignmentUpdated = (updated: AssignmentResponse) => {
    setAssignments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
    setEditingAssignment(null);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
            Draft
          </span>
        );
      case 'published':
        return (
          <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded-full">
            Published
          </span>
        );
      case 'closed':
        return (
          <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
            Closed
          </span>
        );
    }
  };

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isOverdue = date < now;
    return {
      text: date.toLocaleDateString(),
      isOverdue,
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[#4a7a2a]" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">{error}</div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#4a7a2a]" />
            Assignments
          </h2>
          <p className="text-sm text-gray-600">
            {assignments.length} assignment{assignments.length !== 1 ? 's' : ''}
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#4a7a2a] text-white rounded-lg font-medium hover:bg-[#3a6a1a] transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Assignment
        </button>
      </div>

      {/* Assignment List */}
      {assignments.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No assignments yet. Create one to get started.</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-[#4a7a2a] text-white rounded-lg font-medium hover:bg-[#3a6a1a]"
          >
            Create First Assignment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const dueInfo = formatDueDate(assignment.due_date);
            return (
              <div
                key={assignment.id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-gray-800">{assignment.title}</h3>
                      {getStatusBadge(assignment.status)}
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {dueInfo && (
                        <div
                          className={`flex items-center gap-1 ${
                            dueInfo.isOverdue ? 'text-red-600' : ''
                          }`}
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          Due {dueInfo.text}
                          {dueInfo.isOverdue && ' (overdue)'}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {assignment.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(assignment)}
                        disabled={publishingId === assignment.id}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                      >
                        {publishingId === assignment.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        Publish
                      </button>
                    )}

                    {assignment.status === 'published' && (
                      <button
                        onClick={() =>
                          navigate(`/t/classes/${classroomId}/assignments/${assignment.id}`)
                        }
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4a7a2a] text-white text-sm font-medium rounded-lg hover:bg-[#3a6a1a] transition-colors"
                      >
                        <BarChart3 className="w-4 h-4" />
                        Progress
                      </button>
                    )}

                    <button
                      onClick={() => setEditingAssignment(assignment)}
                      className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(assignment)}
                      disabled={deletingId === assignment.id}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletingId === assignment.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <AssignmentFormModal
          classroomId={classroomId}
          onClose={() => setShowCreateModal(false)}
          onCreated={handleAssignmentCreated}
        />
      )}

      {/* Edit Modal */}
      {editingAssignment && (
        <AssignmentFormModal
          classroomId={classroomId}
          assignment={editingAssignment}
          onClose={() => setEditingAssignment(null)}
          onUpdated={handleAssignmentUpdated}
        />
      )}
    </div>
  );
}
