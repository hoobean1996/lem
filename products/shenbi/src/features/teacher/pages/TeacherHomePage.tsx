import {
  GraduationCap,
  Users,
  Monitor,
  ChevronRight,
  BookOpen,
  BarChart3,
  Clock,
  CheckCircle,
  Zap,
  Paintbrush,
  FileText,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../../infrastructure/i18n';

export default function TeacherHomePage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e8f5e0] rounded-full text-[#4a7a2a] text-sm mb-6">
            <GraduationCap className="w-4 h-4 text-[#4a7a2a]" />
            {t('teacher.badge')}
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 leading-tight">
            {t('teacher.headline1')}
            <br />
            <span className="text-[#4a7a2a]">{t('teacher.headline2')}</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {t('teacher.heroDesc')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            <Link
              to="/t/classes"
              className="flex items-center gap-2 px-8 py-4 bg-[#4a7a2a] text-white rounded-2xl font-bold text-lg hover:bg-[#3a6a1a] transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <Users className="w-5 h-5" />
              My Classes
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4a7a2a]">4</div>
              <div className="text-gray-600 text-sm">{t('teacher.storyAdventures')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4a7a2a]">40+</div>
              <div className="text-gray-600 text-sm">{t('teacher.lessonLevels')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4a7a2a]">
                {t('teacher.realTimeTracking')}
              </div>
              <div className="text-gray-600 text-sm">{t('teacher.progressTracking')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
            {t('teacher.classroomFeatures')}
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            {t('teacher.featuresDesc')}
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Real-time Monitoring */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200">
              <div className="w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mb-4">
                <Monitor className="w-6 h-6 text-[#4a7a2a]" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('teacher.liveDashboard')}</h3>
              <p className="text-gray-600">{t('teacher.liveDashboardDesc')}</p>
            </div>

            {/* Progress Tracking */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200">
              <div className="w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-[#4a7a2a]" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {t('teacher.progressAnalytics')}
              </h3>
              <p className="text-gray-600">{t('teacher.progressAnalyticsDesc')}</p>
            </div>

            {/* Synchronized Learning */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200">
              <div className="w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-[#4a7a2a]" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('teacher.classSync')}</h3>
              <p className="text-gray-600">{t('teacher.classSyncDesc')}</p>
            </div>

            {/* Assignments */}
            <div className="bg-white rounded-3xl p-6 border border-gray-200">
              <div className="w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-[#4a7a2a]" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Assignments</h3>
              <p className="text-gray-600">Create and manage homework with automatic grading</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            {t('teacher.howItWorks')}
          </h2>

          <div className="space-y-6">
            <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="w-10 h-10 bg-[#4a7a2a] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">{t('teacher.step1Title')}</h4>
                <p className="text-gray-600">{t('teacher.step1Desc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="w-10 h-10 bg-[#4a7a2a] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">{t('teacher.step2Title')}</h4>
                <p className="text-gray-600">{t('teacher.step2Desc')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-gray-50 rounded-2xl p-6 border border-gray-200">
              <div className="w-10 h-10 bg-[#4a7a2a] rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h4 className="font-bold text-gray-800 mb-1">{t('teacher.step3Title')}</h4>
                <p className="text-gray-600">{t('teacher.step3Desc')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            {t('teacher.whyTeachersLove')}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-[#4a7a2a]" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{t('teacher.saveTime')}</h4>
              <p className="text-gray-600 text-sm">{t('teacher.saveTimeDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[#4a7a2a]" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{t('teacher.noSetup')}</h4>
              <p className="text-gray-600 text-sm">{t('teacher.noSetupDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-[#4a7a2a]" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{t('teacher.readyContent')}</h4>
              <p className="text-gray-600 text-sm">{t('teacher.readyContentDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-[#4a7a2a]" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{t('teacher.engageStudents')}</h4>
              <p className="text-gray-600 text-sm">{t('teacher.engageStudentsDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">{t('teacher.readyToStart')}</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">{t('teacher.readyToStartDesc')}</p>
          <Link
            to="/t/classes"
            className="inline-flex items-center gap-2 px-8 py-4 bg-[#4a7a2a] text-white rounded-2xl font-bold text-lg hover:bg-[#3a6a1a] transition-all shadow-xl hover:shadow-2xl hover:scale-105"
          >
            <Users className="w-5 h-5" />
            {t('teacher.startClassNow')}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#4a7a2a] rounded-xl flex items-center justify-center">
                <Paintbrush className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="font-bold text-gray-800">{t('teacher.forTeachers')}</div>
                <div className="text-gray-600 text-sm">{t('teacher.empoweringEducators')}</div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-gray-600 text-sm">
              <Link to="/" className="hover:text-[#4a7a2a] transition-colors">
                {t('teacher.studentHome')}
              </Link>
              <Link to="/t/classes" className="hover:text-[#4a7a2a] transition-colors">
                My Classes
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
