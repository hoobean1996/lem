import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import { Layout } from './features/shared/components/Layout';
import { TeacherRoute } from './features/teacher/components/TeacherRoute';
import { SettingsProvider } from './features/shared/contexts/SettingsContext';
import { AdventureProvider } from './features/shared/contexts/AdventureContext';
import { AuthProvider, useAuth } from './features/shared/contexts/AuthContext';
import { LanguageProvider } from './infrastructure/i18n';
import { useProfile } from './infrastructure/storage/useStorage';

// Lazy load all pages
const LandingPage = lazy(() => import('./features/shared/pages/LandingPage'));
const LoginPage = lazy(() => import('./features/shared/pages/LoginPage'));
const HomePage = lazy(() => import('./features/student/pages/HomePage'));

// Lazy load student pages
const AdventureListPage = lazy(() => import('./features/student/pages/AdventureListPage'));
const LevelListPage = lazy(() => import('./features/student/pages/LevelListPage'));
const LevelPage = lazy(() => import('./features/student/pages/GamePage'));
const BattlePage = lazy(() => import('./features/student/pages/BattlePage'));
const SettingsPage = lazy(() => import('./features/shared/pages/SettingsPage'));
const ProfilePage = lazy(() => import('./features/shared/pages/ProfilePage'));
const PlaygroundPage = lazy(() => import('./features/shared/pages/PlaygroundPage'));
const StudentClassroomPage = lazy(() => import('./features/student/pages/StudentClassroomPage'));

// Notebook pages
const NotebookPage = lazy(() =>
  import('./features/notebook').then((m) => ({ default: m.NotebookPage }))
);

// Lazy load teacher pages
const TeacherHomePage = lazy(() => import('./features/teacher/pages/TeacherHomePage'));
const ClassroomManagementPage = lazy(
  () => import('./features/teacher/pages/ClassroomManagementPage')
);
const ClassroomDetailPage = lazy(() => import('./features/teacher/pages/ClassroomDetailPage'));
const AssignmentDetailPage = lazy(() => import('./features/teacher/pages/AssignmentDetailPage'));

// Upgrade pages
const UpgradeSuccessPage = lazy(() => import('./features/shared/pages/UpgradeSuccessPage'));
const UpgradeCancelPage = lazy(() => import('./features/shared/pages/UpgradeCancelPage'));

// Loading fallback component
function PageLoader() {
  return (
    <div className="flex items-center justify-center h-[60vh]">
      <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
    </div>
  );
}

// Full screen loading for device ID initialization
function InitLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#e8f5e0] via-white to-[#f0f9eb]">
      <Loader2 className="w-8 h-8 animate-spin text-[#4a7a2a]" />
    </div>
  );
}

// Layout wrapper that includes auth check and Layout
function AppLayout() {
  const { loading, isAuthenticated } = useAuth();

  if (loading) {
    return <InitLoader />;
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
}

// Role-based home redirect - teachers go to /t, students stay on /
function RoleBasedHome() {
  const { profile, loading } = useProfile();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a7a2a]" />
      </div>
    );
  }

  // If teacher or admin, redirect to teacher home
  if (profile?.role === 'teacher' || profile?.role === 'admin') {
    return <Navigate to="/t" replace />;
  }

  // Otherwise show student home
  return <HomePage />;
}

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <LanguageProvider>
          <SettingsProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {/* Public pages - no auth required */}
                  <Route path="/landing" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />

                  {/* All app routes - wrapped in AppLayout (requires auth) */}
                  <Route element={<AppLayout />}>
                    {/* Student routes */}
                    <Route path="/" element={<RoleBasedHome />} />
                    <Route path="/playground" element={<PlaygroundPage />} />
                    <Route path="/battle" element={<BattlePage />} />
                    <Route path="/battle/:roomCode" element={<BattlePage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/settings" element={<SettingsPage />} />

                    {/* Student classroom management (My Classes) */}
                    <Route path="/my-classes" element={<StudentClassroomPage />} />

                    {/* Notebook routes */}
                    <Route path="/notebook" element={<NotebookPage />} />
                    <Route path="/notebook/:id" element={<NotebookPage />} />

                    {/* Upgrade routes (Stripe redirect pages) */}
                    <Route path="/upgrade/success" element={<UpgradeSuccessPage />} />
                    <Route path="/upgrade/cancel" element={<UpgradeCancelPage />} />

                    {/* Adventure routes - wrapped in AdventureProvider */}
                    <Route
                      path="/adventure"
                      element={
                        <AdventureProvider>
                          <AdventureListPage />
                        </AdventureProvider>
                      }
                    />
                    <Route
                      path="/adventure/:adventureId/levels"
                      element={
                        <AdventureProvider>
                          <LevelListPage />
                        </AdventureProvider>
                      }
                    />
                    <Route
                      path="/adventure/:adventureId/levels/:levelId"
                      element={
                        <AdventureProvider>
                          <LevelPage />
                        </AdventureProvider>
                      }
                    />

                    {/* Teacher routes - protected by TeacherRoute */}
                    <Route path="/t">
                      <Route
                        index
                        element={
                          <TeacherRoute>
                            <TeacherHomePage />
                          </TeacherRoute>
                        }
                      />
                      <Route
                        path="profile"
                        element={
                          <TeacherRoute>
                            <ProfilePage />
                          </TeacherRoute>
                        }
                      />
                      <Route
                        path="settings"
                        element={
                          <TeacherRoute>
                            <SettingsPage />
                          </TeacherRoute>
                        }
                      />
                      {/* Classroom management routes */}
                      <Route
                        path="classes"
                        element={
                          <TeacherRoute>
                            <ClassroomManagementPage />
                          </TeacherRoute>
                        }
                      />
                      <Route
                        path="classes/:classroomId"
                        element={
                          <TeacherRoute>
                            <ClassroomDetailPage />
                          </TeacherRoute>
                        }
                      />
                      <Route
                        path="classes/:classroomId/assignments/:assignmentId"
                        element={
                          <TeacherRoute>
                            <AssignmentDetailPage />
                          </TeacherRoute>
                        }
                      />
                      {/* Teacher adventure routes */}
                      <Route
                        path="adventure"
                        element={
                          <TeacherRoute>
                            <AdventureProvider>
                              <AdventureListPage />
                            </AdventureProvider>
                          </TeacherRoute>
                        }
                      />
                      <Route
                        path="adventure/:adventureId/levels"
                        element={
                          <TeacherRoute>
                            <AdventureProvider>
                              <LevelListPage />
                            </AdventureProvider>
                          </TeacherRoute>
                        }
                      />
                      <Route
                        path="adventure/:adventureId/levels/:levelId"
                        element={
                          <TeacherRoute>
                            <AdventureProvider>
                              <LevelPage />
                            </AdventureProvider>
                          </TeacherRoute>
                        }
                      />
                    </Route>
                  </Route>
                </Routes>
              </Suspense>
            </BrowserRouter>
          </SettingsProvider>
        </LanguageProvider>
      </AuthProvider>
    </HelmetProvider>
  );
}

export default App;
