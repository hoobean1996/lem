/**
 * TeacherRoute - Route guard for teacher-only pages
 *
 * Redirects non-teachers to the home page.
 */

import { Navigate } from 'react-router-dom';
import { useProfile } from '../../../infrastructure/storage';
import { Loader2 } from 'lucide-react';

interface TeacherRouteProps {
  children: React.ReactNode;
}

export function TeacherRoute({ children }: TeacherRouteProps) {
  const { profile, loading } = useProfile();

  // Show loading while fetching profile
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-[#4a7a2a]" />
      </div>
    );
  }

  // Redirect non-teachers to home
  if (profile?.role !== 'teacher' && profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
