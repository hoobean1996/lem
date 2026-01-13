/**
 * Grade Override Modal
 *
 * Modal for teachers to manually override a student's grade.
 */

import { useState } from 'react';
import { X, Edit, Loader2, Star } from 'lucide-react';
import {
  classroomApi,
  SubmissionResponse,
  ApiError,
} from '../../../../infrastructure/services/api';

interface GradeOverrideModalProps {
  classroomId: number;
  assignmentId: number;
  submission: SubmissionResponse;
  onClose: () => void;
  onUpdated: (submission: SubmissionResponse) => void;
}

export default function GradeOverrideModal({
  classroomId,
  assignmentId,
  submission,
  onClose,
  onUpdated,
}: GradeOverrideModalProps) {
  const [manualGrade, setManualGrade] = useState<string>(
    submission.manual_grade !== null ? submission.manual_grade.toString() : ''
  );
  const [teacherNotes, setTeacherNotes] = useState(submission.teacher_notes || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const grade = manualGrade.trim() === '' ? null : parseFloat(manualGrade);
    if (grade !== null && (isNaN(grade) || grade < 0 || grade > 100)) {
      setError('Grade must be between 0 and 100');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const updated = await classroomApi.gradeSubmission(classroomId, assignmentId, submission.id, {
        manual_grade: grade,
        teacher_notes: teacherNotes.trim() || null,
      });

      onUpdated(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError('Failed to update grade');
      }
    } finally {
      setLoading(false);
    }
  };

  const clearManualGrade = async () => {
    try {
      setLoading(true);
      setError(null);

      const updated = await classroomApi.gradeSubmission(classroomId, assignmentId, submission.id, {
        manual_grade: null,
        teacher_notes: teacherNotes.trim() || null,
      });

      onUpdated(updated);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError('Failed to clear grade');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Edit className="w-5 h-5 text-[#4a7a2a]" />
            <h2 className="text-lg font-bold text-gray-800">Grade Override</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Student Info */}
          <div className="p-4 bg-gray-50 rounded-xl">
            <div className="font-medium text-gray-800">
              {submission.display_name || `Student ${submission.student_id}`}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
              <span>
                Progress: {submission.levels_completed}/{submission.total_levels} levels
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                {submission.total_stars} stars
              </span>
            </div>
            {submission.grade_percentage !== null && (
              <div className="text-sm text-gray-600 mt-1">
                Calculated grade: {submission.grade_percentage.toFixed(1)}%
              </div>
            )}
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Manual Grade */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manual Grade Override
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={manualGrade}
                onChange={(e) => setManualGrade(e.target.value)}
                placeholder="Leave empty for auto-grade"
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7a2a] focus:border-[#4a7a2a] outline-none"
                min={0}
                max={100}
                step={0.1}
              />
              <span className="text-gray-600">%</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Enter a value to override the calculated grade, or leave empty to use auto-grade.
            </p>
          </div>

          {/* Teacher Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (visible to teacher only)
            </label>
            <textarea
              value={teacherNotes}
              onChange={(e) => setTeacherNotes(e.target.value)}
              placeholder="Optional notes about this student's work..."
              className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#4a7a2a] focus:border-[#4a7a2a] outline-none resize-none"
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            {submission.manual_grade !== null && (
              <button
                type="button"
                onClick={clearManualGrade}
                disabled={loading}
                className="px-4 py-2.5 border border-orange-300 text-orange-600 rounded-xl font-medium hover:bg-orange-50 transition-colors disabled:opacity-50"
              >
                Clear Override
              </button>
            )}
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
              disabled={loading}
              className="flex-1 py-2.5 bg-[#4a7a2a] text-white rounded-xl font-medium hover:bg-[#3a6a1a] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
