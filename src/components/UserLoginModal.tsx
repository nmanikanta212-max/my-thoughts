import React, { useState } from 'react';
import {
  X,
  User,
  ShieldCheck,
  CheckCircle,
  Download,
  Mail,
  Building,
  Key,
  Film,
  Sparkles,
  LogOut,
  LogIn,
  Clock,
  Layers,
  Save,
} from 'lucide-react';
import { UserProfile, ExportHistoryItem } from '../types/user';
import { SupportedLanguage, getTranslation } from '../utils/i18n';

interface UserLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdateUser: (updatedUser: UserProfile) => void;
  exportHistory: ExportHistoryItem[];
  currentLanguage: SupportedLanguage;
}

export const UserLoginModal: React.FC<UserLoginModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdateUser,
  exportHistory,
  currentLanguage,
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'profile' | 'history' | 'switch'>('profile');
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email);
  const [editOrg, setEditOrg] = useState(user.organization);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const t = (key: string) => getTranslation(currentLanguage, key);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: editName,
      email: editEmail,
      organization: editOrg,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleSimulateLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail) return;
    onUpdateUser({
      ...user,
      email: loginEmail,
      name: loginEmail.split('@')[0],
      isLoggedIn: true,
    });
    setActiveTab('profile');
  };

  const handleToggleLogin = () => {
    if (user.isLoggedIn) {
      onUpdateUser({
        ...user,
        isLoggedIn: false,
      });
    } else {
      onUpdateUser({
        ...user,
        isLoggedIn: true,
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <User className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">{t('user_profile')}</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {user.tier}
                </span>
              </div>
              <p className="text-xs text-zinc-400">{user.email}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 px-6 pt-2">
          <button
            onClick={() => setActiveTab('profile')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'profile'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Director Info & Tier
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'history'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Export History ({exportHistory.length})
          </button>
          <button
            onClick={() => setActiveTab('switch')}
            className={`pb-2.5 px-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'switch'
                ? 'border-amber-400 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Switch Account / Login
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {activeTab === 'profile' && (
            <div className="space-y-5">
              {/* Profile Card Summary */}
              <div className="bg-zinc-950 p-4 rounded-xl border border-zinc-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <img
                    src={user.avatarUrl}
                    alt={user.name}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-amber-500/40 shadow-md"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-white">{user.name}</h4>
                    <p className="text-xs text-amber-400/90 font-medium">{user.role}</p>
                    <p className="text-[11px] text-zinc-400">{user.organization}</p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-500">CREDIT BALANCE</span>
                  <span className="text-xs font-bold font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
                    UNLIMITED (0 CREDITS)
                  </span>
                  <span className="text-[10px] text-zinc-400">4K 60FPS Enabled</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-zinc-950/60 border border-zinc-800/80 p-3 rounded-xl">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Total Films</div>
                  <div className="text-base font-bold text-white mt-0.5">{user.totalExportsCount} Projects</div>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-800/80 p-3 rounded-xl">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Render Time</div>
                  <div className="text-base font-bold text-amber-400 mt-0.5">{user.totalRenderMinutes} Mins</div>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-800/80 p-3 rounded-xl">
                  <div className="text-[10px] font-mono text-zinc-500 uppercase">Max Resolution</div>
                  <div className="text-base font-bold text-emerald-400 mt-0.5">4K Ultra HD</div>
                </div>
              </div>

              {/* Editable Profile Form */}
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-2">
                <h5 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Update Account Details
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-zinc-400">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] text-zinc-400">Email Address</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400">Studio / Production House</label>
                  <input
                    type="text"
                    value={editOrg}
                    onChange={(e) => setEditOrg(e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="flex items-center justify-between pt-2">
                  {saveSuccess ? (
                    <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium">
                      <CheckCircle className="w-3.5 h-3.5" /> Profile successfully updated!
                    </span>
                  ) : <div />}

                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="text-xs text-zinc-400 flex justify-between items-center">
                <span>Recent 4K & HD Film Exports</span>
                <span className="font-mono text-emerald-400">0 Credits Charged</span>
              </div>

              {exportHistory.length === 0 ? (
                <div className="p-8 text-center bg-zinc-950 rounded-xl border border-zinc-800 text-zinc-500 text-xs">
                  No video exports recorded in this session yet. Click "Export 4K Video" to render your first master cut!
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {exportHistory.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between hover:border-zinc-700 transition"
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold text-white">{item.filmTitle}</div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-2 font-mono">
                          <span className="text-amber-400">{item.resolution}</span>
                          <span>•</span>
                          <span>{item.fps} FPS</span>
                          <span>•</span>
                          <span>{item.durationSeconds}s</span>
                          <span>•</span>
                          <span>{item.fileSizeMb} MB</span>
                        </div>
                      </div>

                      {item.downloadUrl && (
                        <a
                          href={item.downloadUrl}
                          download={`${item.filmTitle.toLowerCase().replace(/[^a-z0-9]/g, '_')}_4k.webm`}
                          className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-amber-500/30 transition"
                        >
                          <Download className="w-3.5 h-3.5" /> Re-Download
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'switch' && (
            <form onSubmit={handleSimulateLogin} className="space-y-4">
              <div className="bg-zinc-950/80 p-4 rounded-xl border border-zinc-800 space-y-2">
                <h5 className="text-xs font-bold text-white flex items-center gap-2">
                  <LogIn className="w-4 h-4 text-amber-400" /> Switch Director Account or Sign In
                </h5>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Sign in to link projects, cloud save screenplay beats, and sync custom character seed libraries. All accounts receive unlimited 4K exports with 0 credits required.
                </p>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-[11px] text-zinc-400">Account Email</label>
                  <input
                    type="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="e.g. director@cinema.studio"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400">Password / Access Passphrase</label>
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleToggleLogin}
                  className="text-xs text-zinc-400 hover:text-white underline flex items-center gap-1"
                >
                  {user.isLoggedIn ? 'Sign Out / Switch to Guest' : 'Use Default Studio Pro Account'}
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 text-xs font-bold shadow-md transition"
                >
                  Sign In to Studio
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs">
          <span className="text-zinc-500 font-mono text-[11px]">
            SESSION ID: PRO-DIR-8315 • STATUS: ACTIVE
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
