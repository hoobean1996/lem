/**
 * Student Classroom Page
 *
 * Shows classrooms the student has joined and their assignments.
 */

import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Plus,
  Loader2,
  BookOpen,
  Calendar,
  ArrowRight,
  LogOut,
} from 'lucide-react';
import { useLanguage } from '../../../infrastructure/i18n';
import {
  classroomApi,
  ClassroomResponse,
  AssignmentResponse,
  ApiError,
} from '../../../infrastructure/services/api';
import JoinClassroomModal from '../../teacher/components/classroom-management/JoinClassroomModal';
import { error as logError } from '../../../infrastructure/logging';

export default function StudentClassroomPage() {
  const { t } = useLanguage();

  const [classrooms, setClassrooms] = useState<ClassroomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [leavingId, setLeavingId] = useState<number | null>(null);

  const loadClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classroomApi.listEnrolled();
      setClassrooms(response);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError('Failed to load classrooms');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClassrooms();
  }, [loadClassrooms]);

  const handleLeave = async (classroom: ClassroomResponse) => {
    if (!confirm(t('classroom.leaveClassConfirm'))) {
      return;
    }

    try {
      setLeavingId(classroom.id);
      await classroomApi.leave(classroom.id);
      setClassrooms((prev) => prev.filter((c) => c.id !== classroom.id));
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.detail || 'Failed to leave classroom');
      }
    } finally {
      setLeavingId(null);
    }
  };

  const handleJoined = (classroom: ClassroomResponse) => {
    setClassrooms((prev) => [classroom, ...prev]);
    setShowJoinModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a7a2a]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <GraduationCap className="w-7 h-7 text-[#4a7a2a]" />
                My Classes
              </h1>
              <p className="text-gray-600 mt-1">View your enrolled classes and assignments</p>
            </div>
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#4a7a2a] text-white rounded-xl font-medium hover:bg-[#3a6a1a] transition-colors"
            >
              <Plus className="w-5 h-5" />
              Join Class
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {classrooms.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
            <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">{t('classroom.noClassesYet')}</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">{t('classroom.noClassesDesc')}</p>
            <button
              onClick={() => setShowJoinModal(true)}
              className="px-6 py-3 bg-[#4a7a2a] text-white rounded-xl font-bold hover:bg-[#3a6a1a] transition-colors"
            >
              {t('classroom.joinClass')}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {classrooms.map((classroom) => (
              <div
                key={classroom.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden"
              >
                {/* Classroom Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">{classroom.name}</h3>
                    </div>
                    <button
                      onClick={() => handleLeave(classroom)}
                      disabled={leavingId === classroom.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    >
                      {leavingId === classroom.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <LogOut className="w-4 h-4" />
                      )}
                      {t('classroom.leave')}
                    </button>
                  </div>
                </div>

                {/* Classroom Content */}
                <div className="p-5">
                  <ClassroomAssignments classroomId={classroom.id} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Join Modal */}
      {showJoinModal && (
        <JoinClassroomModal onClose={() => setShowJoinModal(false)} onJoined={handleJoined} />
      )}
    </div>
  );
}

// Sub-component to show assignments for a classroom
function ClassroomAssignments({ classroomId }: { classroomId: number }) {
  const [assignments, setAssignments] = useState<AssignmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const response = await classroomApi.listAssignments(classroomId);
        // Only show published assignments to students
        setAssignments(response.filter((a) => a.status === 'published'));
      } catch (err) {
        logError('Failed to load assignments', err, { classroomId }, 'StudentClassroomPage');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [classroomId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="text-center py-4 text-gray-500">No assignments yet. Check back later!</div>
    );
  }

  const formatDueDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();
    const isOverdue = date < now;
    return { text: date.toLocaleDateString(), isOverdue };
  };

  return (
    <div className="space-y-3">
      <h4 className="font-medium text-gray-700 flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        Assignments ({assignments.length})
      </h4>
      {assignments.map((assignment) => {
        const dueInfo = formatDueDate(assignment.due_date);
        return (
          <Link
            key={assignment.id}
            to={`/my-classes/${classroomId}/assignments/${assignment.id}`}
            className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
          >
            <div>
              <div className="font-medium text-gray-800">{assignment.title}</div>
              <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                {dueInfo && (
                  <span className={dueInfo.isOverdue ? 'text-red-600' : ''}>
                    <Calendar className="w-3.5 h-3.5 inline mr-1" />
                    Due {dueInfo.text}
                  </span>
                )}
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </Link>
        );
      })}
    </div>
  );
}
