/**
 * Classroom Management Page
 *
 * Main hub for teachers to manage their persistent classrooms.
 */

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Plus,
  Users,
  ArrowLeft,
  GraduationCap,
  Copy,
  Check,
  Settings,
  Trash2,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../../infrastructure/i18n';
import { classroomApi, ClassroomResponse, ApiError } from '../../../infrastructure/services/api';
import CreateClassroomModal from '../components/classroom-management/CreateClassroomModal';

export default function ClassroomManagementPage() {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [classrooms, setClassrooms] = useState<ClassroomResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadClassrooms = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await classroomApi.listOwned();
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

  const handleCopyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async (classroomId: number, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeletingId(classroomId);
      await classroomApi.delete(classroomId);
      setClassrooms((prev) => prev.filter((c) => c.id !== classroomId));
    } catch (err) {
      if (err instanceof ApiError) {
        alert(err.detail || 'Failed to delete classroom');
      }
    } finally {
      setDeletingId(null);
    }
  };

  const handleClassroomCreated = (classroom: ClassroomResponse) => {
    setClassrooms((prev) => [classroom, ...prev]);
    setShowCreateModal(false);
    // Navigate to the new classroom's detail page
    navigate(`/t/classes/${classroom.id}`);
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
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Back link */}
          <Link
            to="/t"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('common.back')}
          </Link>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <GraduationCap className="w-7 h-7 text-[#4a7a2a]" />
                My Classes
              </h1>
              <p className="text-gray-600 mt-1">
                Manage your persistent classroom rosters and assignments
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#4a7a2a] text-white rounded-xl font-medium hover:bg-[#3a6a1a] transition-colors"
            >
              <Plus className="w-5 h-5" />
              New Class
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {classrooms.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎓</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">No Classes Yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first classroom to start managing students and assignments
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-[#4a7a2a] text-white rounded-xl font-bold hover:bg-[#3a6a1a] transition-colors"
            >
              Create Your First Class
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classrooms.map((classroom) => (
              <div
                key={classroom.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Card Header */}
                <div className="p-5 border-b border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">{classroom.name}</h3>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        classroom.is_active
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {classroom.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 mt-4">
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span className="text-sm">{classroom.member_count} students</span>
                    </div>
                  </div>

                  {/* Join Code */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2 font-mono text-lg font-bold text-center text-gray-800 tracking-wider">
                      {classroom.join_code}
                    </div>
                    <button
                      onClick={() => handleCopyCode(classroom.join_code)}
                      className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                      title="Copy join code"
                    >
                      {copiedCode === classroom.join_code ? (
                        <Check className="w-5 h-5 text-green-600" />
                      ) : (
                        <Copy className="w-5 h-5 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Card Actions */}
                <div className="p-3 bg-gray-50 flex gap-2">
                  <button
                    onClick={() => navigate(`/t/classes/${classroom.id}`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-white bg-[#4a7a2a] rounded-lg hover:bg-[#3a6a1a] transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Manage
                  </button>
                  <button
                    onClick={() => navigate(`/t/classes/${classroom.id}?tab=gradebook`)}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    Gradebook
                  </button>
                  <button
                    onClick={() => handleDelete(classroom.id, classroom.name)}
                    disabled={deletingId === classroom.id}
                    className="flex items-center justify-center px-3 py-2 text-red-600 bg-white rounded-lg border border-gray-200 hover:bg-red-50 transition-colors disabled:opacity-50"
                  >
                    {deletingId === classroom.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <CreateClassroomModal
          onClose={() => setShowCreateModal(false)}
          onCreated={handleClassroomCreated}
        />
      )}
    </div>
  );
}
