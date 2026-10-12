import React, { useState, useRef } from 'react';
import { FilmProject, Shot } from './types/cinema';
import { SAMPLE_PROJECTS } from './data/sampleProjects';
import { UserProfile, ExportHistoryItem, INITIAL_USER } from './types/user';
import { SupportedLanguage, getTranslation } from './utils/i18n';
import { Header } from './components/Header';
import { DirectorPlayer } from './components/DirectorPlayer';
import { TimelineEditor } from './components/TimelineEditor';
import { ScreenplayBibleView } from './components/ScreenplayBibleView';
import { MediaBinView } from './components/MediaBinView';
import { DownloadHub } from './components/DownloadHub';
import { AudioVoiceoverStudio } from './components/AudioVoiceoverStudio';
import { GeneratorModal } from './components/GeneratorModal';
import { ExportModal } from './components/ExportModal';
import { ShotDetailModal } from './components/ShotDetailModal';
import { UserLoginModal } from './components/UserLoginModal';
import { drawCinematicFrame, preloadImage } from './utils/canvasRenderer';
import {
  Film,
  Sparkles,
  ShieldCheck,
  Video,
  Download,
  Layers,
  Sliders,
  CheckCircle,
  Camera,
} from 'lucide-react';

export default function App() {
  const [currentProject, setCurrentProject] = useState<FilmProject>(SAMPLE_PROJECTS[0]);
  const [activeView, setActiveView] = useState<'director' | 'storyboard' | 'script' | 'audio' | 'media' | 'downloads'>('director');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('en');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);

  // Export history record
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([
    {
      id: 'exp-1',
      filmTitle: 'Chronicles of Event Horizon: Deep Void',
      resolution: '4K Ultra HD (3840×2160)',
      fps: 24,
      durationSeconds: 24,
      fileSizeMb: 118.4,
      timestamp: '2026-10-11 18:42',
    },
    {
      id: 'exp-2',
      filmTitle: 'Neon Ronin: Shinjuku 2099',
      resolution: '4K Ultra HD (3840×2160)',
      fps: 60,
      durationSeconds: 17,
      fileSizeMb: 94.2,
      timestamp: '2026-10-11 19:15',
    },
  ]);

  // Modals state
  const [isGeneratorOpen, setIsGeneratorOpen] = useState<boolean>(false);
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [editingShot, setEditingShot] = useState<Shot | null>(null);

  // Load preset demo
  const handleLoadSample = (id: string) => {
    const found = SAMPLE_PROJECTS.find((p) => p.id === id);
    if (found) {
      setCurrentProject(found);
    }
  };

  // Film generated from modal
  const handleFilmGenerated = (newFilm: FilmProject) => {
    setCurrentProject(newFilm);
    setActiveView('director');
  };

  // Update shot from ShotDetailModal
  const handleSaveShot = (updatedShot: Shot) => {
    const newShots = currentProject.shots.map((s) => (s.id === updatedShot.id ? updatedShot : s));
    setCurrentProject({
      ...currentProject,
      shots: newShots,
    });
  };

  // Free AI image regeneration for a shot
  const handleRegenerateShotImage = async (shotId: string, customPrompt?: string) => {
    const shot = currentProject.shots.find((s) => s.id === shotId);
    if (!shot) return;

    const seed = Math.floor(Math.random() * 899999) + 100000;
    const promptToUse = customPrompt || shot.visualPrompt || shot.sceneDescription;
    const cleanPrompt = encodeURIComponent(
      `${currentProject.style}, ${promptToUse}, ${shot.cameraAngle}, ${shot.cameraLens}, 8k cinema still`
    );

    const freeImageUrl = `/api/proxy-image?prompt=${cleanPrompt}&seed=${seed}&width=1920&height=1080&model=flux`;

    const updatedShots = currentProject.shots.map((s) => {
      if (s.id === shotId) {
        return {
          ...s,
          imageUrl: freeImageUrl,
          customUploadedImage: undefined,
          visualPrompt: promptToUse,
        };
      }
      return s;
    });

    setCurrentProject({
      ...currentProject,
      shots: updatedShots,
    });
  };

  // Handle local asset upload in Media Bin
  const handleUploadAsset = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const nextShotNum = currentProject.shots.length + 1;
        const newShot: Shot = {
          id: `shot-${Date.now()}`,
          shotNumber: nextShotNum,
          title: `Imported Asset ${nextShotNum}`,
          cameraAngle: 'Low Angle Hero',
          cameraLens: '35mm Panavision Prime',
          cameraMovement: {
            type: 'dolly_in',
            speed: 1.0,
            zoomDelta: 0.15,
            panDeltaX: 0,
            panDeltaY: 0,
          },
          lighting: 'Cinematic ambient fill with natural contrast',
          sceneDescription: 'Custom imported user asset footage sequence',
          visualPrompt: 'Imported cinematic sequence',
          imageUrl: dataUrl,
          customUploadedImage: dataUrl,
          duration: 6,
          transition: 'Dissolve',
        };

        setCurrentProject({
          ...currentProject,
          shots: [...currentProject.shots, newShot],
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // 1-Click Snapshot 4K Still Frame
  const handleSnapshotCurrentFrame = async () => {
    const currentShot = currentProject.shots[0];
    if (!currentShot) return;

    // Create 4K offline snapshot canvas
    const canvas = document.createElement('canvas');
    canvas.width = 3840;
    canvas.height = 2160;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imgUrl = currentShot.customUploadedImage || currentShot.imageUrl || '';
    let loadedImg: HTMLImageElement | null = null;
    if (imgUrl) {
      loadedImg = await preloadImage(imgUrl);
    }

    drawCinematicFrame({
      ctx,
      width: 3840,
      height: 2160,
      shot: currentShot,
      progress: 0.5,
      project: currentProject,
      image: loadedImg,
    });

    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProject.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_4K_frame.png`;
        a.click();
        URL.revokeObjectURL(url);

        // Record history
        setExportHistory((prev) => [
          {
            id: `exp-${Date.now()}`,
            filmTitle: `${currentProject.title} (4K Still Snapshot)`,
            resolution: '4K Ultra HD (3840×2160)',
            fps: 1,
            durationSeconds: 1,
            fileSizeMb: Math.round((blob.size / (1024 * 1024)) * 10) / 10,
            timestamp: new Date().toISOString().replace('T', ' ').slice(0, 16),
            downloadUrl: url,
          },
          ...prev,
        ]);
      }
    }, 'image/png');
  };

  const totalDuration = currentProject.shots.reduce((acc, s) => acc + (s.duration || 5), 0);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-amber-500 selection:text-zinc-950 flex flex-col antialiased">
      {/* Studio Navigation Header */}
      <Header
        onOpenGenerator={() => setIsGeneratorOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        onOpenCharacterBible={() => setActiveView('script')}
        onOpenUserModal={() => setIsUserModalOpen(true)}
        onSnapshotCurrentFrame={handleSnapshotCurrentFrame}
        onLoadSample={handleLoadSample}
        currentProjectId={currentProject.id}
        totalDurationSeconds={totalDuration}
        activeView={activeView}
        setActiveView={setActiveView}
        currentLanguage={currentLanguage}
        onChangeLanguage={setCurrentLanguage}
        user={user}
      />

      {/* Main Workspace Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        {/* Active Studio View */}
        {activeView === 'director' && (
          <DirectorPlayer
            project={currentProject}
            onUpdateProject={setCurrentProject}
            onEditShot={(shot) => setEditingShot(shot)}
            onOpenExport={() => setIsExportOpen(true)}
            onSnapshotCurrentFrame={handleSnapshotCurrentFrame}
            currentLanguage={currentLanguage}
          />
        )}

        {activeView === 'storyboard' && (
          <TimelineEditor
            project={currentProject}
            onUpdateProject={setCurrentProject}
            onEditShotDetails={(shot) => setEditingShot(shot)}
            onRegenerateShotImage={handleRegenerateShotImage}
          />
        )}

        {activeView === 'script' && (
          <ScreenplayBibleView
            project={currentProject}
            onUpdateProject={setCurrentProject}
          />
        )}

        {activeView === 'audio' && (
          <AudioVoiceoverStudio
            project={currentProject}
            onUpdateProject={setCurrentProject}
            currentLanguage={currentLanguage}
          />
        )}

        {activeView === 'media' && (
          <MediaBinView
            project={currentProject}
            currentLanguage={currentLanguage}
            onSelectShot={(shot) => setEditingShot(shot)}
            onUploadAsset={handleUploadAsset}
          />
        )}

        {activeView === 'downloads' && (
          <DownloadHub
            project={currentProject}
            currentLanguage={currentLanguage}
            onOpenExportModal={() => setIsExportOpen(true)}
            onSnapshotCurrentFrame={handleSnapshotCurrentFrame}
          />
        )}
      </main>

      {/* Footer Status Bar */}
      <footer className="border-t border-zinc-900 bg-zinc-950 px-4 py-3 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> 100% Free AI Pipeline • Zero Credits Needed
            </span>
            <span className="text-zinc-700">|</span>
            <span className="text-zinc-400">Up to 30 Min Films</span>
            <span className="text-zinc-700">|</span>
            <span className="text-amber-400/90 font-mono">4K Ultra HD 60FPS</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-400">
            <span>Logged in: <strong className="text-zinc-200">{user.email}</strong></span>
            <span>•</span>
            <span>Language: <strong className="text-amber-400 uppercase font-mono">{currentLanguage}</strong></span>
          </div>
        </div>
      </footer>

      {/* Generator Modal */}
      <GeneratorModal
        isOpen={isGeneratorOpen}
        onClose={() => setIsGeneratorOpen(false)}
        onFilmGenerated={handleFilmGenerated}
      />

      {/* 4K Export Modal */}
      <ExportModal
        project={currentProject}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
      />

      {/* Granular Shot & Camera Config Modal */}
      <ShotDetailModal
        shot={editingShot}
        isOpen={!!editingShot}
        onClose={() => setEditingShot(null)}
        onSave={handleSaveShot}
        onRegenerateVisual={handleRegenerateShotImage}
      />

      {/* User Login & Profile Modal */}
      <UserLoginModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        user={user}
        onUpdateUser={setUser}
        exportHistory={exportHistory}
        currentLanguage={currentLanguage}
      />
    </div>
  );
}
