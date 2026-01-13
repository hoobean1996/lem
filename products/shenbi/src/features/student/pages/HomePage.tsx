import { useState, useEffect } from 'react';
import {
  Sparkles,
  Loader2,
  ChevronRight,
  Users,
  Swords,
  Star,
  Code,
  Gamepad2,
  Trophy,
  Zap,
  Heart,
  BookOpen,
  Paintbrush,
  BadgeCheck,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { loadLocalAdventures, ParsedAdventure } from '../../../infrastructure/levels';
import type { AdventureComplexity } from '../../../infrastructure/levels/types';
import { useLanguage } from '../../../infrastructure/i18n';
import { ConnectionError } from '../../shared/components/ConnectionError';
import { error as logError } from '../../../infrastructure/logging';

export default function HomePage() {
  const { t } = useLanguage();
  const [adventures, setAdventures] = useState<ParsedAdventure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Load adventures from local TypeScript files on mount
  useEffect(() => {
    try {
      setIsLoading(true);
      const { adventures: loadedAdventures } = loadLocalAdventures();
      setAdventures(loadedAdventures);
    } catch (err) {
      logError('Failed to load adventures', err, undefined, 'HomePage');
      setLoadError(err instanceof Error ? err.message : 'Failed to load adventures');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return (
    <div className="min-h-full bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 text-center relative">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#e8f5e0] rounded-full text-[#4a7a2a] text-sm mb-6">
            <Sparkles className="w-4 h-4 text-[#4a7a2a]" />
            {t('home.badge')}
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 mb-4 leading-tight">
            {t('home.headline1')}
            <br />
            <span className="text-[#4a7a2a]">{t('home.headline2')}</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            {t('home.description')}
          </p>

          {/* CTA Button */}
          <div className="flex items-center justify-center mb-12">
            <Link
              to="/adventure"
              className="flex items-center gap-2 px-8 py-4 bg-[#4a7a2a] text-white rounded-2xl font-bold text-lg hover:bg-[#3a6a1a] transition-all shadow-xl hover:shadow-2xl hover:scale-105"
            >
              <Gamepad2 className="w-5 h-5" />
              {t('home.chooseAdventure')}
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4a7a2a]">{adventures.length}+</div>
              <div className="text-gray-600 text-sm">{t('home.adventures')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4a7a2a]">50+</div>
              <div className="text-gray-600 text-sm">{t('home.puzzles')}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-[#4a7a2a]">3</div>
              <div className="text-gray-600 text-sm">{t('home.gameModes')}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
            {t('home.twoWaysTitle')}
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            {t('home.twoWaysDescription')}
          </p>

          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Adventure Mode */}
            <Link
              to="/adventure"
              className="group relative bg-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-[#7dad4c] hover:bg-[#f8fdf5] transition-all hover:scale-105 hover:-translate-y-2"
            >
              <div className="absolute top-4 right-4 w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center shadow-lg">
                <BookOpen className="w-6 h-6 text-[#4a7a2a]" />
              </div>
              <div className="text-4xl mb-4">🎮</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('home.adventureMode')}</h3>
              <p className="text-gray-600 mb-4">{t('home.adventureModeDesc')}</p>
              <div className="flex items-center gap-2 text-[#4a7a2a] font-medium">
                {t('home.startPlaying')}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Battle Mode */}
            <Link
              to="/battle"
              className="group relative bg-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-[#7dad4c] hover:bg-[#f8fdf5] transition-all hover:scale-105 hover:-translate-y-2"
            >
              <div className="absolute top-4 right-4 w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center shadow-lg">
                <Swords className="w-6 h-6 text-[#4a7a2a]" />
              </div>
              <div className="text-4xl mb-4">⚔️</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('home.battleMode')}</h3>
              <p className="text-gray-600 mb-4">{t('home.battleModeDesc')}</p>
              <div className="flex items-center gap-2 text-[#4a7a2a] font-medium">
                {t('home.challengeFriend')}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* My Classes */}
            <Link
              to="/my-classes"
              className="group relative bg-gray-50 rounded-3xl p-6 border border-gray-200 hover:border-[#7dad4c] hover:bg-[#f8fdf5] transition-all hover:scale-105 hover:-translate-y-2"
            >
              <div className="absolute top-4 right-4 w-12 h-12 bg-[#e8f5e0] rounded-2xl flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-[#4a7a2a]" />
              </div>
              <div className="text-4xl mb-4">🎓</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{t('home.myClasses')}</h3>
              <p className="text-gray-600 mb-4">{t('home.myClassesDesc')}</p>
              <div className="flex items-center gap-2 text-[#4a7a2a] font-medium">
                {t('home.viewClasses')}
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Why Kids Love It */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-12">
            {t('home.whyKidsLove')}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-[#4a7a2a]" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{t('home.earnStars')}</h4>
              <p className="text-gray-600 text-sm">{t('home.earnStarsDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Heart className="w-8 h-8 text-[#4a7a2a]" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{t('home.kidFriendly')}</h4>
              <p className="text-gray-600 text-sm">{t('home.kidFriendlyDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-[#4a7a2a]" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{t('home.instantFeedback')}</h4>
              <p className="text-gray-600 text-sm">{t('home.instantFeedbackDesc')}</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#e8f5e0] rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Trophy className="w-8 h-8 text-[#4a7a2a]" />
              </div>
              <h4 className="font-bold text-gray-800 mb-2">{t('home.printCertificates')}</h4>
              <p className="text-gray-600 text-sm">{t('home.printCertificatesDesc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Adventures Section */}
      <section id="adventures" className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
            {t('home.chooseAdventure')}
          </h2>
          <p className="text-gray-600 text-center mb-8">{t('home.eachStoryTeaches')}</p>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-4 bg-gray-50 rounded-3xl p-8 shadow-lg">
                <Loader2 className="w-12 h-12 animate-spin text-[#4a7a2a]" />
                <div className="text-lg font-bold text-[#4a7a2a]">
                  {t('home.loadingAdventures')}
                </div>
              </div>
            </div>
          ) : loadError ? (
            <div className="py-8">
              <ConnectionError message={loadError} onRetry={() => window.location.reload()} />
            </div>
          ) : (
            <div className="space-y-4">
              {adventures.map((adventure, index) => (
                <AdventureCard key={adventure.id} adventure={adventure} adventureIndex={index} />
              ))}
            </div>
          )}
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
                <div className="font-bold text-gray-800">{t('home.appName')}</div>
                <div className="text-gray-600 text-sm">{t('home.tagline')}</div>
              </div>
            </div>

            <div className="flex items-center gap-6 text-gray-600 text-sm">
              <Link to="/adventure" className="hover:text-[#4a7a2a] transition-colors">
                {t('home.adventures')}
              </Link>
              <Link to="/battle" className="hover:text-[#4a7a2a] transition-colors">
                {t('home.battle')}
              </Link>
              <Link to="/t" className="hover:text-[#4a7a2a] transition-colors">
                {t('home.teachers')}
              </Link>
            </div>
          </div>

          <div className="text-center text-gray-600 text-sm mt-8">{t('home.footerMessage')}</div>
        </div>
      </footer>
    </div>
  );
}

interface AdventureCardProps {
  adventure: ParsedAdventure;
  adventureIndex: number;
}

// Complexity display config
const complexityConfig = {
  beginner: {
    labelKey: 'home.beginner' as const,
    color: 'text-[#4a7a2a]',
    bgColor: 'bg-[#e8f5e0]',
  },
  easy: { labelKey: 'home.easy' as const, color: 'text-[#4a7a2a]', bgColor: 'bg-[#e8f5e0]' },
  medium: { labelKey: 'home.medium' as const, color: 'text-[#4a7a2a]', bgColor: 'bg-[#e8f5e0]' },
  hard: { labelKey: 'home.hard' as const, color: 'text-[#3a6a1a]', bgColor: 'bg-[#d4ecc8]' },
  expert: { labelKey: 'home.expert' as const, color: 'text-[#2a5a0a]', bgColor: 'bg-[#d4ecc8]' },
} satisfies Record<AdventureComplexity, { labelKey: string; color: string; bgColor: string }>;

function AdventureCard({ adventure, adventureIndex: _adventureIndex }: AdventureCardProps) {
  const { t } = useLanguage();
  const complexity = adventure.complexity ? complexityConfig[adventure.complexity] : null;

  return (
    <Link
      to={`/adventure/${adventure.id}/levels`}
      className="block bg-gray-50 rounded-3xl p-5 border border-gray-200 hover:border-[#7dad4c] hover:bg-[#f8fdf5] transition-all hover:scale-[1.02] hover:-translate-y-1"
    >
      {/* Header with icon and basic info */}
      <div className="flex items-start gap-4 mb-3">
        <div className="w-14 h-14 rounded-2xl bg-[#e8f5e0] flex items-center justify-center text-3xl shadow-inner flex-shrink-0">
          {adventure.icon || '📖'}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="font-bold text-gray-800 text-lg">{adventure.name}</div>
            {/* Official badge for system adventures */}
            {(adventure.userId === 0 || adventure.userId === undefined) && (
              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                {t('adventure.official')}
              </span>
            )}
            {complexity && (
              <span
                className={`px-2 py-0.5 ${complexity.bgColor} ${complexity.color} text-xs font-medium rounded-full`}
              >
                {t(complexity.labelKey)}
              </span>
            )}
          </div>
          <div className="text-gray-600 text-sm mt-0.5">{adventure.description}</div>
        </div>
        <ChevronRight className="w-6 h-6 text-[#7dad4c] flex-shrink-0 mt-1" />
      </div>

      {/* Tags */}
      {adventure.tags && adventure.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {adventure.tags.map((tag: string) => (
            <span
              key={tag}
              className="px-2 py-0.5 bg-[#f0f9e8] text-[#4a7a2a] text-xs rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Footer with meta info */}
      <div className="flex items-center gap-3 text-xs text-gray-600">
        <span className="flex items-center gap-1">
          <Code className="w-3.5 h-3.5" />
          {adventure.levels.length} {t('home.levels')}
        </span>
        {adventure.ageRange && (
          <span className="flex items-center gap-1">
            <Users className="w-3.5 h-3.5" />
            {t('home.ages')} {adventure.ageRange}
          </span>
        )}
      </div>
    </Link>
  );
}
