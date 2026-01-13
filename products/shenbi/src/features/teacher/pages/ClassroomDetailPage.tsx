/**
 * Classroom Detail Page
 *
 * Shows classroom details with tabs for members, assignments, and gradebook.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, FileText, FileSpreadsheet, Settings, Loader2 } from 'lucide-react';
import { useLanguage } from '../../../infrastructure/i18n';
import { classroomApi, ClassroomResponse, ApiError } from '../../../infrastructure/services/api';
import MemberList from '../components/classroom-management/MemberList';
import AssignmentList from '../components/classroom-management/AssignmentList';
import GradebookTable from '../components/classroom-management/GradebookTable';
import JoinCodeDisplay from '../components/classroom-management/JoinCodeDisplay';
import ClassroomSettingsModal from '../components/classroom-management/ClassroomSettingsModal';

type TabType = 'members' | 'assignments' | 'gradebook';

export default function ClassroomDetailPage() {
  const { classroomId } = useParams<{ classroomId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t: _t } = useLanguage();

  const [classroom, setClassroom] = useState<ClassroomResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Get active tab from URL or default to 'members'
  const activeTab = (searchParams.get('tab') as TabType) || 'members';

  const setActiveTab = (tab: TabType) => {
    setSearchParams({ tab });
  };

  const loadClassroom = useCallback(async () => {
    if (!classroomId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await classroomApi.get(parseInt(classroomId));
      setClassroom(data);
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 404) {
          setError('Classroom not found');
        } else if (err.status === 403) {
          setError('You do not have access to this classroom');
        } else {
          setError(err.detail || err.message);
        }
      } else {
        setError('Failed to load classroom');
      }
    } finally {
      setLoading(false);
    }
  }, [classroomId]);

  useEffect(() => {
    loadClassroom();
  }, [loadClassroom]);

  const handleClassroomUpdated = (updated: ClassroomResponse) => {
    setClassroom(updated);
    setShowSettings(false);
  };

  // Only show full-page loading on initial load (when no classroom data yet)
  if (loading && !classroom) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a7a2a]" />
      </div>
    );
  }

  if (error || !classroom) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Link
            to="/t/classes"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Classes
          </Link>
          <div className="text-center py-16">
            <div className="text-6xl mb-4">😕</div>
            <h2 className="text-xl font-bold text-gray-700 mb-2">
              {error || 'Classroom not found'}
            </h2>
            <button
              onClick={() => navigate('/t/classes')}
              className="mt-4 px-6 py-2 bg-[#4a7a2a] text-white rounded-xl font-medium hover:bg-[#3a6a1a]"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            to="/t/classes"
            className="inline-flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Classes
          </Link>

          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-800">{classroom.name}</h1>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    classroom.is_active
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {classroom.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {classroom.description && (
                <p className="text-gray-600 mt-1">{classroom.description}</p>
              )}
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                <span>{classroom.member_count ?? 0} students</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <JoinCodeDisplay
                code={classroom.join_code}
                classroomId={classroom.id}
                allowJoin={classroom.allow_join}
                onCodeRegenerated={(newCode) => setClassroom({ ...classroom, join_code: newCode })}
              />
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-6 border-b border-gray-200 -mb-px">
            <button
              onClick={() => setActiveTab('members')}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'members'
                  ? 'border-[#4a7a2a] text-[#4a7a2a]'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <Users className="w-4 h-4" />
              Members
            </button>
            <button
              onClick={() => setActiveTab('assignments')}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'assignments'
                  ? 'border-[#4a7a2a] text-[#4a7a2a]'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              Assignments
            </button>
            <button
              onClick={() => setActiveTab('gradebook')}
              className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'gradebook'
                  ? 'border-[#4a7a2a] text-[#4a7a2a]'
                  : 'border-transparent text-gray-600 hover:text-gray-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Gradebook
            </button>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {activeTab === 'members' && (
          <MemberList
            classroomId={classroom.id}
            onMemberCountChange={(count) => setClassroom({ ...classroom, member_count: count })}
          />
        )}
        {activeTab === 'assignments' && <AssignmentList classroomId={classroom.id} />}
        {activeTab === 'gradebook' && <GradebookTable classroomId={classroom.id} />}
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <ClassroomSettingsModal
          classroom={classroom}
          onClose={() => setShowSettings(false)}
          onUpdated={handleClassroomUpdated}
        />
      )}
    </div>
  );
}
