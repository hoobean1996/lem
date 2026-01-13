/**
 * Assignment Detail Page
 *
 * Shows student progress on a specific assignment.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  Users,
  Star,
  Loader2,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
} from 'lucide-react';
import {
  classroomApi,
  AssignmentResponse,
  SubmissionResponse,
  ApiError,
} from '../../../infrastructure/services/api';
import GradeOverrideModal from '../components/classroom-management/GradeOverrideModal';

export default function AssignmentDetailPage() {
  const { classroomId, assignmentId } = useParams<{
    classroomId: string;
    assignmentId: string;
  }>();

  const [assignment, setAssignment] = useState<AssignmentResponse | null>(null);
  const [progress, setProgress] = useState<SubmissionResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingSubmission, setEditingSubmission] = useState<SubmissionResponse | null>(null);

  const loadData = useCallback(async () => {
    if (!classroomId || !assignmentId) return;

    try {
      setLoading(true);
      setError(null);

      const [assignmentData, progressData] = await Promise.all([
        classroomApi.getAssignment(parseInt(classroomId), parseInt(assignmentId)),
        classroomApi.listSubmissions(parseInt(classroomId), parseInt(assignmentId)),
      ]);

      setAssignment(assignmentData);
      setProgress(progressData);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError('Failed to load assignment');
      }
    } finally {
      setLoading(false);
    }
  }, [classroomId, assignmentId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleGradeUpdated = (updated: SubmissionResponse) => {
    setProgress((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setEditingSubmission(null);
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  const getGradeColor = (grade: number | null) => {
    if (grade === null) return 'text-gray-400';
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a7a2a]" />
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              {error || 'Assignment not found'}
            </h2>
            <Link
              to={`/t/classes/${classroomId}?tab=assignments`}
              className="mt-4 inline-block px-6 py-2 bg-[#4a7a2a] text-white rounded-xl font-medium hover:bg-[#3a6a1a]"
            >
              Go Back
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate stats - use final_grade or grade_percentage for effective grade
  const getEffectiveGrade = (p: SubmissionResponse) => p.final_grade ?? p.grade_percentage;
  const isComplete = (p: SubmissionResponse) => p.levels_completed >= p.total_levels;
  const hasStarted = (p: SubmissionResponse) => p.levels_completed > 0;

  const completedCount = progress.filter(isComplete).length;
  const startedCount = progress.filter((p) => hasStarted(p) && !isComplete(p)).length;
  const notStartedCount = progress.length - completedCount - startedCount;
  const avgGrade =
    progress.filter((p) => getEffectiveGrade(p) !== null).length > 0
      ? progress
          .filter((p) => getEffectiveGrade(p) !== null)
          .reduce((sum, p) => sum + (getEffectiveGrade(p) || 0), 0) /
        progress.filter((p) => getEffectiveGrade(p) !== null).length
      : null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            to={`/t/classes/${classroomId}?tab=assignments`}
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Assignments
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6 text-[#4a7a2a]" />
                {assignment.title}
              </h1>
              {assignment.description && (
                <p className="text-gray-600 mt-1">{assignment.description}</p>
              )}
              <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4" />
                  {assignment.max_points} pts
                </div>
                {assignment.due_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Due {formatDate(assignment.due_date)}
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-4">
              <div className="text-center px-4 py-2 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                <div className="text-xs text-green-700">Completed</div>
              </div>
              <div className="text-center px-4 py-2 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">{startedCount}</div>
                <div className="text-xs text-blue-700">In Progress</div>
              </div>
              <div className="text-center px-4 py-2 bg-gray-100 rounded-xl">
                <div className="text-2xl font-bold text-gray-600">{notStartedCount}</div>
                <div className="text-xs text-gray-600">Not Started</div>
              </div>
              {avgGrade !== null && (
                <div className="text-center px-4 py-2 bg-purple-50 rounded-xl">
                  <div className="text-2xl font-bold text-purple-600">{avgGrade.toFixed(0)}%</div>
                  <div className="text-xs text-purple-700">Avg Grade</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Table */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {progress.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No students have been assigned this work yet.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Student</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                    Progress
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Stars</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">Grade</th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                    Status
                  </th>
                  <th className="text-center px-4 py-3 text-sm font-medium text-gray-600">
                    Last Activity
                  </th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-gray-600">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {progress.map((student) => {
                  const effectiveGrade = getEffectiveGrade(student);
                  return (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-800">
                          {student.display_name || `Student ${student.student_id}`}
                        </div>
                        {student.teacher_notes && (
                          <div className="text-xs text-gray-500 mt-0.5">
                            Note: {student.teacher_notes}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#4a7a2a] rounded-full"
                              style={{
                                width: `${(student.levels_completed / student.total_levels) * 100}%`,
                              }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">
                            {student.levels_completed}/{student.total_levels}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-0.5">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="text-sm">{student.total_stars}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-medium ${getGradeColor(effectiveGrade)}`}>
                          {effectiveGrade !== null ? `${effectiveGrade.toFixed(0)}%` : '-'}
                        </span>
                        {student.manual_grade !== null && (
                          <span className="text-xs text-purple-600 ml-1">(manual)</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isComplete(student) ? (
                          <span className="inline-flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-4 h-4" />
                            Complete
                          </span>
                        ) : hasStarted(student) ? (
                          <span className="inline-flex items-center gap-1 text-blue-600">
                            <Clock className="w-4 h-4" />
                            In Progress
                          </span>
                        ) : (
                          <span className="text-gray-400">Not Started</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-600">
                        {formatDate(student.submitted_at)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => setEditingSubmission(student)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Grade
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Grade Override Modal */}
      {editingSubmission && assignment && (
        <GradeOverrideModal
          classroomId={parseInt(classroomId!)}
          assignmentId={parseInt(assignmentId!)}
          submission={editingSubmission}
          onClose={() => setEditingSubmission(null)}
          onUpdated={handleGradeUpdated}
        />
      )}
    </div>
  );
}
