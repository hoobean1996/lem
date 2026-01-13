/**
 * Profile Page
 *
 * Displays and allows editing of user profile information.
 */

import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import {
  User,
  GraduationCap,
  Calendar,
  Save,
  Edit2,
  Loader2,
  Crown,
  Star,
  Trophy,
  Sparkles,
  ChevronRight,
  X,
  BookOpen,
  Layers,
} from 'lucide-react';
import { useProfile, useUserProgress, useTeacherContent } from '../../../infrastructure/storage';
import { useLanguage } from '../../../infrastructure/i18n';
import { BadgeGrid } from '../components/badges';
import { getEarnedBadges } from '../../../core/badges';
import { ConnectionError } from '../components/ConnectionError';
import { UpgradeModal } from '../components/UpgradeModal';

const AVATAR_OPTIONS = [
  '🧒',
  '👦',
  '👧',
  '🧒🏻',
  '👦🏻',
  '👧🏻',
  '🐰',
  '🐱',
  '🐶',
  '🦊',
  '🐼',
  '🐨',
  '🦁',
  '🐯',
  '🐸',
  '🐵',
];

export default function ProfilePage() {
  const location = useLocation();
  const isTeacher = location.pathname.startsWith('/t/');

  const { t } = useLanguage();
  const { profile, loading, error, updateProfile } = useProfile();
  const { userData, error: progressError } = useUserProgress();
  const { adventures } = useTeacherContent();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    grade: '',
    age: '',
    avatar: '',
  });
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 bg-white/90 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <Loader2 className="w-16 h-16 animate-spin text-[#5a8a3a]" />
          <div className="text-2xl font-bold text-[#4a7a2a]">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  // Error state
  if (error || progressError) {
    return (
      <div className="min-h-full bg-white flex items-center justify-center p-4">
        <ConnectionError
          message={error || progressError || undefined}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (!profile) {
    return null;
  }

  const handleEdit = () => {
    setEditForm({
      name: profile.name || '',
      grade: profile.grade || '',
      age: profile.age?.toString() || '',
      avatar: profile.avatar || '🧒',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateProfile({
      name: editForm.name || 'Student',
      grade: editForm.grade || undefined,
      age: editForm.age ? parseInt(editForm.age, 10) : undefined,
      avatar: editForm.avatar || '🧒',
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const isPremium = profile.subscriptionTier === 'premium';
  const earnedBadges = getEarnedBadges(userData?.achievements || []);

  return (
    <div className="min-h-full bg-white">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#e8f5e0] via-[#f0f9e8] to-white">
        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-3xl bg-white shadow-xl flex items-center justify-center text-6xl border-4 border-white overflow-hidden">
                {profile.avatar?.startsWith('http') ? (
                  <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  profile.avatar || '🧒'
                )}
              </div>
              {isPremium && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-amber-400 rounded-full flex items-center justify-center shadow-lg">
                  <Crown className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            {/* Name & Info */}
            <div className="text-center sm:text-left flex-1">
              <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
                {isPremium && (
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                    {t('subscription.premium')}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-gray-600">
                {profile.grade && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="w-4 h-4" />
                    {profile.grade}
                  </span>
                )}
                {profile.age && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {profile.age} {t('profile.yearsOld')}
                  </span>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleEdit}
                className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-[#4a7a2a] font-medium rounded-xl border border-gray-200 hover:border-[#7dad4c] transition-all shadow-sm"
              >
                <Edit2 className="w-4 h-4" />
                {t('profile.editProfile')}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Stats Section - Different for Teacher vs Student */}
        {isTeacher ? (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-200 text-center hover:border-[#7dad4c] hover:bg-[#f8fdf5] transition-all">
              <div className="w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-[#4a7a2a]" />
              </div>
              <div className="text-3xl font-bold text-[#4a7a2a]">{adventures.length}</div>
              <div className="text-gray-600 text-sm">{t('profile.adventuresCreated')}</div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-200 text-center hover:border-[#7dad4c] hover:bg-[#f8fdf5] transition-all">
              <div className="w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Layers className="w-6 h-6 text-[#4a7a2a]" />
              </div>
              <div className="text-3xl font-bold text-[#4a7a2a]">
                {adventures.reduce((sum, a) => sum + a.levels.length, 0)}
              </div>
              <div className="text-gray-600 text-sm">{t('profile.levelsCreated')}</div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-200 text-center hover:border-[#7dad4c] hover:bg-[#f8fdf5] transition-all">
              <div className="w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Star className="w-6 h-6 text-[#4a7a2a]" />
              </div>
              <div className="text-3xl font-bold text-[#4a7a2a]">
                {userData?.progress.totalStars || 0}
              </div>
              <div className="text-gray-600 text-sm">{t('profile.totalStars')}</div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-200 text-center hover:border-[#7dad4c] hover:bg-[#f8fdf5] transition-all">
              <div className="w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Trophy className="w-6 h-6 text-[#4a7a2a]" />
              </div>
              <div className="text-3xl font-bold text-[#4a7a2a]">
                {userData?.progress.completedLevels || 0}
              </div>
              <div className="text-gray-600 text-sm">{t('profile.completedLevels')}</div>
            </div>

            <div className="bg-gray-50 rounded-3xl p-5 border border-gray-200 text-center hover:border-[#7dad4c] hover:bg-[#f8fdf5] transition-all">
              <div className="w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-[#4a7a2a]" />
              </div>
              <div className="text-3xl font-bold text-[#4a7a2a]">{earnedBadges.size}</div>
              <div className="text-gray-600 text-sm">{t('profile.badges')}</div>
            </div>
          </div>
        )}

        {/* Subscription Card */}
        {profile.subscriptionTier && (
          <div
            className={`rounded-3xl p-6 mb-8 border transition-all ${
              isPremium
                ? 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200'
                : 'bg-gray-50 border-gray-200 hover:border-[#7dad4c]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner ${
                    isPremium ? 'bg-amber-100' : 'bg-[#e8f5e0]'
                  }`}
                >
                  {isPremium ? (
                    <Crown className="w-7 h-7 text-amber-500" />
                  ) : (
                    <User className="w-7 h-7 text-[#4a7a2a]" />
                  )}
                </div>
                <div>
                  <h3
                    className={`font-bold text-lg ${
                      isPremium ? 'text-amber-700' : 'text-gray-800'
                    }`}
                  >
                    {isPremium ? t('subscription.premium') : t('subscription.freeTier')}
                  </h3>
                  {isPremium && profile.subscriptionStartedAt && (
                    <p className="text-sm text-amber-600">
                      {t('subscription.subscribedOn')}{' '}
                      {new Date(profile.subscriptionStartedAt).toLocaleDateString()}
                    </p>
                  )}
                  {isPremium && profile.subscriptionExpiresAt && (
                    <p className="text-sm text-amber-600">
                      {t('subscription.expiresOn')}{' '}
                      {new Date(profile.subscriptionExpiresAt).toLocaleDateString()}
                    </p>
                  )}
                  {!isPremium && (
                    <p className="text-sm text-gray-500">{t('subscription.upgradeSubtitle')}</p>
                  )}
                </div>
              </div>
              {!isPremium && (
                <button
                  onClick={() => setShowUpgradeModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-[#4a7a2a] hover:bg-[#3a6a1a] text-white font-medium rounded-xl transition-colors"
                >
                  {t('subscription.upgradeButton')}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Badges Section - Only for students */}
        {!isTeacher && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#4a7a2a]" />
              {t('profile.badges')}
            </h2>
            <BadgeGrid earnedBadges={earnedBadges} />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">{t('profile.editProfile')}</h2>
              <button
                onClick={handleCancel}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-5">
              {/* Avatar Selector */}
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-2">
                  {t('profile.avatar')}
                </label>
                <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-2xl">
                  {/* Show Google profile picture option if user has one */}
                  {profile.avatar?.startsWith('http') && (
                    <button
                      onClick={() => setEditForm({ ...editForm, avatar: profile.avatar || '' })}
                      className={`w-12 h-12 rounded-xl overflow-hidden transition-all ${
                        editForm.avatar === profile.avatar
                          ? 'ring-2 ring-[#4a7a2a] scale-110 shadow-md'
                          : 'border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <img
                        src={profile.avatar}
                        alt="Google avatar"
                        className="w-full h-full object-cover"
                      />
                    </button>
                  )}
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      onClick={() => setEditForm({ ...editForm, avatar })}
                      className={`w-12 h-12 rounded-xl text-2xl flex items-center justify-center transition-all ${
                        editForm.avatar === avatar
                          ? 'bg-[#e8f5e0] ring-2 ring-[#4a7a2a] scale-110 shadow-md'
                          : 'bg-white hover:bg-gray-100 border border-gray-200'
                      }`}
                    >
                      {avatar}
                    </button>
                  ))}
                </div>
              </div>

              {/* Name */}
              <div>
                <label className="block text-gray-700 font-medium text-sm mb-1">
                  {t('profile.name')}
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7dad4c] focus:border-transparent"
                    placeholder={t('profile.namePlaceholder')}
                  />
                </div>
              </div>

              {/* Grade - Only for students */}
              {!isTeacher && (
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1">
                    {t('profile.grade')}{' '}
                    <span className="text-gray-400 font-normal">{t('profile.optional')}</span>
                  </label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={editForm.grade}
                      onChange={(e) => setEditForm({ ...editForm, grade: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7dad4c] focus:border-transparent"
                      placeholder={t('profile.gradePlaceholder')}
                    />
                  </div>
                </div>
              )}

              {/* Age - Only for students */}
              {!isTeacher && (
                <div>
                  <label className="block text-gray-700 font-medium text-sm mb-1">
                    {t('profile.age')}{' '}
                    <span className="text-gray-400 font-normal">{t('profile.optional')}</span>
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      min="3"
                      max="18"
                      value={editForm.age}
                      onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#7dad4c] focus:border-transparent"
                      placeholder={t('profile.agePlaceholder')}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleSave}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#4a7a2a] hover:bg-[#3a6a1a] text-white font-bold rounded-xl transition-colors shadow-lg"
                >
                  <Save className="w-5 h-5" />
                  {t('common.save')}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                >
                  {t('common.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Modal */}
      {showUpgradeModal && <UpgradeModal onClose={() => setShowUpgradeModal(false)} />}
    </div>
  );
}
