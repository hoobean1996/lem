/**
 * Layout Component
 *
 * Provides consistent left sidebar navigation across all pages.
 * Sidebar can be collapsed to icon-only mode.
 */

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Paintbrush,
  BookOpen,
  Swords,
  ChevronLeft,
  ChevronRight,
  Home,
  Settings,
  User,
  GraduationCap,
} from 'lucide-react';
import { useTranslation } from '../../../infrastructure/i18n';

interface LayoutProps {
  children: React.ReactNode;
}

const STORAGE_KEY = 'shenbi-sidebar-collapsed';

export function Layout({ children }: LayoutProps) {
  const { t } = useTranslation();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  });

  // Detect if we're in teacher view
  const isTeacherView = location.pathname.startsWith('/t');

  // Persist collapse state
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, String(isCollapsed));
  }, [isCollapsed]);

  const isActive = (path: string) => {
    if (path === '/' || path === '/t') return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  // Student navigation items
  const studentNavItems = [
    { path: '/', icon: Home, labelKey: 'nav.home' as const },
    { path: '/adventure', icon: BookOpen, labelKey: 'nav.adventure' as const },
    { path: '/battle', icon: Swords, labelKey: 'nav.battle' as const },
    { path: '/my-classes', icon: GraduationCap, labelKey: 'nav.myClasses' as const },
  ];

  // Teacher navigation items
  const teacherNavItems = [
    { path: '/t', icon: Home, labelKey: 'nav.home' as const },
    { path: '/t/classes', icon: GraduationCap, labelKey: 'nav.myClasses' as const },
  ];

  const navItems = isTeacherView ? teacherNavItems : studentNavItems;

  return (
    <div className="min-h-screen flex">
      {/* Left Sidebar */}
      <nav
        className={`fixed top-0 left-0 h-full z-50 flex flex-col backdrop-blur-md bg-[#4a7a2a] border-r border-white/10 transition-all duration-300 ${
          isCollapsed ? 'w-16' : 'w-52'
        }`}
      >
        {/* Logo */}
        <Link
          to={isTeacherView ? '/t' : '/'}
          className={`flex items-center gap-3 p-4 hover:bg-white/10 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg flex-shrink-0">
            <Paintbrush className="w-6 h-6 text-[#4a7a2a]" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold text-white whitespace-nowrap">Shenbi</span>
          )}
        </Link>

        {/* Navigation Links */}
        <div className="flex-1 flex flex-col gap-1 px-2 py-4">
          {navItems.map(({ path, icon: Icon, labelKey }) => (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all ${
                isCollapsed ? 'justify-center' : ''
              } ${
                isActive(path)
                  ? 'bg-white/20 text-white shadow-lg'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
              title={isCollapsed ? t(labelKey) : undefined}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="font-medium whitespace-nowrap">{t(labelKey)}</span>}
            </Link>
          ))}
        </div>

        {/* Profile Link */}
        <Link
          to={isTeacherView ? '/t/profile' : '/profile'}
          className={`flex items-center gap-3 px-3 py-3 mx-2 rounded-xl transition-all ${
            isCollapsed ? 'justify-center' : ''
          } ${
            isActive('/profile') || isActive('/t/profile')
              ? 'bg-white/20 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title={isCollapsed ? t('nav.profile') : undefined}
        >
          <User className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium whitespace-nowrap">{t('nav.profile')}</span>
          )}
        </Link>

        {/* Settings Link */}
        <Link
          to={isTeacherView ? '/t/settings' : '/settings'}
          className={`flex items-center gap-3 px-3 py-3 mx-2 rounded-xl transition-all ${
            isCollapsed ? 'justify-center' : ''
          } ${
            isActive('/settings') || isActive('/t/settings')
              ? 'bg-white/20 text-white shadow-lg'
              : 'text-white/70 hover:text-white hover:bg-white/10'
          }`}
          title={isCollapsed ? t('nav.settings') : undefined}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && (
            <span className="font-medium whitespace-nowrap">{t('nav.settings')}</span>
          )}
        </Link>

        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`flex items-center gap-3 px-3 py-4 m-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all ${
            isCollapsed ? 'justify-center' : ''
          }`}
          title={isCollapsed ? t('nav.expand') : t('nav.collapse')}
        >
          {isCollapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <>
              <ChevronLeft className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium whitespace-nowrap">{t('nav.collapse')}</span>
            </>
          )}
        </button>
      </nav>

      {/* Main Content - offset by sidebar width */}
      <main
        className={`flex-1 h-screen overflow-y-auto transition-all duration-300 ${
          isCollapsed ? 'ml-16' : 'ml-52'
        }`}
      >
        {children}
      </main>
    </div>
  );
}
