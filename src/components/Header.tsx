import React, { useState } from 'react';
import {
  Film,
  Sparkles,
  Download,
  Layers,
  Play,
  Plus,
  ShieldCheck,
  Video,
  Sliders,
  Globe,
  User,
  ChevronDown,
  Camera,
  FileText,
  HelpCircle,
  Clock,
  Tv,
  Music,
  Mic,
} from 'lucide-react';
import { SupportedLanguage, LANGUAGES, getTranslation } from '../utils/i18n';
import { UserProfile } from '../types/user';

interface HeaderProps {
  onOpenGenerator: () => void;
  onOpenExport: () => void;
  onOpenCharacterBible: () => void;
  onOpenUserModal: () => void;
  onSnapshotCurrentFrame: () => void;
  onLoadSample: (id: string) => void;
  currentProjectId: string;
  totalDurationSeconds: number;
  activeView: 'director' | 'storyboard' | 'script' | 'audio' | 'media' | 'downloads';
  setActiveView: (view: 'director' | 'storyboard' | 'script' | 'audio' | 'media' | 'downloads') => void;
  currentLanguage: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  user: UserProfile;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenGenerator,
  onOpenExport,
  onOpenCharacterBible,
  onOpenUserModal,
  onSnapshotCurrentFrame,
  onLoadSample,
  currentProjectId,
  totalDurationSeconds,
  activeView,
  setActiveView,
  currentLanguage,
  onChangeLanguage,
  user,
}) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const t = (key: string) => getTranslation(currentLanguage, key);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  const currentLangObj = LANGUAGES.find((l) => l.code === currentLanguage) || LANGUAGES[0];

  return (
    <header className="border-b border-zinc-800/90 bg-zinc-950/95 backdrop-blur-xl sticky top-0 z-40 select-none">
      {/* Top Professional DAW/NLE Menu Strip */}
      <div className="border-b border-zinc-900 px-4 py-1 flex items-center justify-between text-[11px] text-zinc-400">
        <div className="flex items-center gap-4">
          <span className="font-mono text-zinc-500 font-semibold tracking-wider">CINEFORGE PRO NLE</span>
          <div className="flex items-center gap-1">
            {/* File Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'file' ? null : 'file')}
                className="px-2 py-0.5 rounded hover:bg-zinc-800 hover:text-white transition cursor-pointer"
              >
                {t('file_menu')}
              </button>
              {activeMenu === 'file' && (
                <div
                  className="absolute left-0 top-full mt-1 w-48 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl py-1 z-50 text-xs text-zinc-200"
                  onClick={() => setActiveMenu(null)}
                >
                  <button
                    onClick={onOpenGenerator}
                    className="w-full text-left px-3 py-1.5 hover:bg-amber-500 hover:text-zinc-950 transition flex items-center justify-between"
                  >
                    <span>New Film Project...</span>
                    <span className="text-[10px] font-mono opacity-60">⌘N</span>
                  </button>
                  <button
                    onClick={onOpenExport}
                    className="w-full text-left px-3 py-1.5 hover:bg-amber-500 hover:text-zinc-950 transition flex items-center justify-between"
                  >
                    <span>Export 4K Master...</span>
                    <span className="text-[10px] font-mono opacity-60">⌘E</span>
                  </button>
                  <button
                    onClick={onSnapshotCurrentFrame}
                    className="w-full text-left px-3 py-1.5 hover:bg-amber-500 hover:text-zinc-950 transition flex items-center justify-between"
                  >
                    <span>Save 4K Still Snapshot</span>
                    <span className="text-[10px] font-mono opacity-60">⌘S</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sequence Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'edit' ? null : 'edit')}
                className="px-2 py-0.5 rounded hover:bg-zinc-800 hover:text-white transition cursor-pointer"
              >
                {t('edit_menu')}
              </button>
              {activeMenu === 'edit' && (
                <div
                  className="absolute left-0 top-full mt-1 w-48 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl py-1 z-50 text-xs text-zinc-200"
                  onClick={() => setActiveMenu(null)}
                >
                  <button
                    onClick={() => setActiveView('storyboard')}
                    className="w-full text-left px-3 py-1.5 hover:bg-amber-500 hover:text-zinc-950 transition"
                  >
                    Timeline & Storyboard
                  </button>
                  <button
                    onClick={onOpenCharacterBible}
                    className="w-full text-left px-3 py-1.5 hover:bg-amber-500 hover:text-zinc-950 transition"
                  >
                    Character Consistency Bible
                  </button>
                </div>
              )}
            </div>

            {/* View Menu */}
            <div className="relative">
              <button
                onClick={() => setActiveMenu(activeMenu === 'view' ? null : 'view')}
                className="px-2 py-0.5 rounded hover:bg-zinc-800 hover:text-white transition cursor-pointer"
              >
                {t('view_menu')}
              </button>
              {activeMenu === 'view' && (
                <div
                  className="absolute left-0 top-full mt-1 w-44 bg-zinc-900 border border-zinc-700/80 rounded-xl shadow-2xl py-1 z-50 text-xs text-zinc-200"
                  onClick={() => setActiveMenu(null)}
                >
                  <button
                    onClick={() => setActiveView('director')}
                    className="w-full text-left px-3 py-1.5 hover:bg-amber-500 hover:text-zinc-950 transition"
                  >
                    Director Studio Monitor
                  </button>
                  <button
                    onClick={() => setActiveView('media')}
                    className="w-full text-left px-3 py-1.5 hover:bg-amber-500 hover:text-zinc-950 transition"
                  >
                    Media Bin & Assets
                  </button>
                  <button
                    onClick={() => setActiveView('downloads')}
                    className="w-full text-left px-3 py-1.5 hover:bg-amber-500 hover:text-zinc-950 transition"
                  >
                    Download Center
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Info Strip */}
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-semibold">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> 0 CREDITS REQUIRED • 100% FREE PIPELINE
          </span>
          <span className="text-zinc-700">|</span>
          <span className="text-zinc-400 font-mono text-[10px]">
            MAX: 30:00 • 3840×2160 60FPS
          </span>
        </div>
      </div>

      {/* Main Studio Bar */}
      <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Edition */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
              <Film className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-white uppercase font-sans">
                CineForge <span className="text-amber-400 font-mono">PRO</span>
              </h1>
              <span className="text-[9px] uppercase font-mono tracking-widest px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
                STUDIO v3.8
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 flex items-center gap-2">
              <span>{t('duration_30m')}</span>
              <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
              <span className="text-emerald-400 font-mono font-medium">{t('format_4k')}</span>
            </p>
          </div>
        </div>

        {/* View Switcher Tabs (Pro Segmented Control) */}
        <div className="flex items-center bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs">
          <button
            onClick={() => setActiveView('director')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'director'
                ? 'bg-amber-500 text-zinc-950 shadow font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            {t('director_studio')}
          </button>
          <button
            onClick={() => setActiveView('storyboard')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'storyboard'
                ? 'bg-amber-500 text-zinc-950 shadow font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {t('storyboard_timeline')}
          </button>
          <button
            onClick={() => setActiveView('script')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'script'
                ? 'bg-amber-500 text-zinc-950 shadow font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            {t('screenplay_bible')}
          </button>
          <button
            onClick={() => setActiveView('audio')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'audio'
                ? 'bg-amber-500 text-zinc-950 shadow font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            {t('audio_studio')}
          </button>
          <button
            onClick={() => setActiveView('media')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'media'
                ? 'bg-amber-500 text-zinc-950 shadow font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            {t('media_assets')}
          </button>
          <button
            onClick={() => setActiveView('downloads')}
            className={`px-3 py-1.5 font-medium rounded-lg transition-all flex items-center gap-1.5 ${
              activeView === 'downloads'
                ? 'bg-amber-500 text-zinc-950 shadow font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Download className="w-3.5 h-3.5" />
            {t('downloads_hub')}
          </button>
        </div>

        {/* Right Controls: Language Selector, User Profile, Quick Export */}
        <div className="flex items-center gap-2 flex-wrap justify-end">
          {/* Language Selector Dropdown */}
          <div className="relative group">
            <div className="flex items-center gap-1.5 bg-zinc-900 border border-zinc-700/80 rounded-lg px-2.5 py-1.5 text-xs text-zinc-300 hover:border-zinc-500 transition cursor-pointer">
              <span className="text-sm">{currentLangObj.flag}</span>
              <span className="font-medium text-white">{currentLangObj.name}</span>
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </div>

            <select
              value={currentLanguage}
              onChange={(e) => onChangeLanguage(e.target.value as SupportedLanguage)}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-zinc-900 text-white">
                  {lang.flag} {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* User Profile Capsule */}
          <button
            onClick={onOpenUserModal}
            className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 hover:border-amber-400/50 rounded-lg px-2.5 py-1.5 transition text-left"
            title="Director Profile & Account"
          >
            <div className="relative w-6 h-6 rounded-md overflow-hidden border border-amber-500/50">
              <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            </div>
            <div className="hidden sm:block leading-none">
              <div className="text-xs font-bold text-white truncate max-w-[110px]">{user.name}</div>
              <div className="text-[9px] font-mono text-emerald-400">0 CREDITS PRO</div>
            </div>
          </button>

          {/* New AI Film Button */}
          <button
            onClick={onOpenGenerator}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 border border-amber-500/30 hover:border-amber-400 transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{t('generate_film')}</span>
          </button>

          {/* 4K Export Action */}
          <button
            onClick={onOpenExport}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 shadow-md shadow-amber-500/20 transition active:scale-95"
          >
            <Download className="w-3.5 h-3.5 text-zinc-950" />
            <span>{t('export_4k')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
