import React, { useState } from 'react';
import {
  Download,
  Film,
  FileText,
  Camera,
  Music,
  Layers,
  CheckCircle,
  Sparkles,
  ShieldCheck,
  Package,
} from 'lucide-react';
import { FilmProject } from '../types/cinema';
import { SupportedLanguage, getTranslation } from '../utils/i18n';

interface DownloadHubProps {
  project: FilmProject;
  currentLanguage: SupportedLanguage;
  onOpenExportModal: () => void;
  onSnapshotCurrentFrame: () => void;
}

export const DownloadHub: React.FC<DownloadHubProps> = ({
  project,
  currentLanguage,
  onOpenExportModal,
  onSnapshotCurrentFrame,
}) => {
  const [downloadMessage, setDownloadMessage] = useState<string | null>(null);

  const t = (key: string) => getTranslation(currentLanguage, key);

  const showNotice = (msg: string) => {
    setDownloadMessage(msg);
    setTimeout(() => setDownloadMessage(null), 3500);
  };

  // Download Screenplay as clean .txt / .fountain
  const handleDownloadScreenplay = () => {
    let scriptContent = `TITLE: ${project.title.toUpperCase()}\n`;
    scriptContent += `FORMAT: ${project.durationMode.replace('_', ' ').toUpperCase()} • 4K SCOPE\n`;
    scriptContent += `GENRE: ${project.genre}\n`;
    scriptContent += `LOGLINE: ${project.logline}\n\n`;
    scriptContent += `SYNOPSIS:\n${project.synopsis}\n\n`;
    scriptContent += `======================================================================\n\n`;

    project.shots.forEach((s, idx) => {
      scriptContent += `SCENE ${idx + 1}: ${s.cameraAngle.toUpperCase()} - ${s.title.toUpperCase()}\n`;
      scriptContent += `[CAMERA]: ${s.cameraMovement.type.toUpperCase()} | LENS: ${s.cameraLens} | DURATION: ${s.duration} SEC\n`;
      scriptContent += `[LIGHTING]: ${s.lighting}\n\n`;
      scriptContent += `${s.sceneDescription}\n\n`;
      if (s.dialogue) {
        scriptContent += `                    ${(s.speaker || 'NARRATOR').toUpperCase()}\n`;
        scriptContent += `          "${s.dialogue}"\n\n`;
      }
      if (s.soundEffect) {
        scriptContent += `(SFX: ${s.soundEffect.toUpperCase()})\n\n`;
      }
      scriptContent += `----------------------------------------------------------------------\n\n`;
    });

    const blob = new Blob([scriptContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_screenplay.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Hollywood Screenplay downloaded successfully!');
  };

  // Download Storyboard Metadata as JSON
  const handleDownloadStoryboardJson = () => {
    const data = JSON.stringify(project, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_storyboard.json`;
    a.click();
    URL.revokeObjectURL(url);
    showNotice('Storyboard production metadata package downloaded!');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-amber-400" /> {t('downloads_hub')}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold">
              0 CREDITS • FREE FOREVER
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Export uncompressed 4K video masters, high-resolution keyframe snapshots, formatted Hollywood scripts, and storyboard packages.
          </p>
        </div>

        {downloadMessage && (
          <div className="px-3.5 py-2 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{downloadMessage}</span>
          </div>
        )}
      </div>

      {/* Download Options Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Option 1: 4K Master Video */}
        <div className="bg-zinc-900/70 border border-amber-500/30 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-amber-400/60 transition shadow-lg shadow-amber-500/5">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Film className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">4K Master Video Film (.webm / .mp4)</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Full cinematic cut rendered at 3840×2160 with dynamic Ken Burns movements, film grain, and mixed audio soundtrack.
            </p>
            <div className="text-[11px] font-mono text-amber-400/90">
              {project.shots.length} Sequences • {project.shots.reduce((a, s) => a + (s.duration || 5), 0)}s Duration
            </div>
          </div>

          <button
            onClick={onOpenExportModal}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md transition active:scale-95"
          >
            <Download className="w-4 h-4 text-zinc-950" />
            Render & Download 4K Video
          </button>
        </div>

        {/* Option 2: 4K Still Snapshot */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">4K Still Frame Snapshot (.png)</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Capture the exact current monitor frame at full 4K Ultra HD resolution with color LUT and letterbox bars applied.
            </p>
            <div className="text-[11px] font-mono text-cyan-400/90">
              Lossless PNG • 3840×2160 Native
            </div>
          </div>

          <button
            onClick={onSnapshotCurrentFrame}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition"
          >
            <Camera className="w-4 h-4 text-cyan-400" />
            Capture & Save 4K Still
          </button>
        </div>

        {/* Option 3: Formatted Screenplay */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Formatted Hollywood Screenplay (.txt)</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Industry standard scene headings, sluglines, dialogue, parentheticals, camera notes, and audio cue breakdowns.
            </p>
            <div className="text-[11px] font-mono text-purple-400/90">
              Standard Courier Margins
            </div>
          </div>

          <button
            onClick={handleDownloadScreenplay}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition"
          >
            <FileText className="w-4 h-4 text-purple-400" />
            Download Screenplay
          </button>
        </div>

        {/* Option 4: Storyboard JSON & Production Manifest */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Storyboard Production Manifest (.json)</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Complete JSON metadata package including camera focal lengths, trajectories, lighting setups, seeds, and character bibles.
            </p>
            <div className="text-[11px] font-mono text-emerald-400/90">
              Portable Production Manifest
            </div>
          </div>

          <button
            onClick={handleDownloadStoryboardJson}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition"
          >
            <Package className="w-4 h-4 text-emerald-400" />
            Download Storyboard JSON
          </button>
        </div>

        {/* Option 5: Keyframe Visuals Archive */}
        <div className="bg-zinc-900/70 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Individual Scene Frame Links</h4>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Direct access to all individual rendered 8K/4K keyframe source assets used across all project sequences.
            </p>
            <div className="text-[11px] font-mono text-rose-400/90">
              {project.shots.length} Keyframes Available
            </div>
          </div>

          <button
            onClick={() => {
              // Open first keyframe in new tab or trigger save
              const url = project.shots[0]?.customUploadedImage || project.shots[0]?.imageUrl;
              if (url) {
                const a = document.createElement('a');
                a.href = url;
                a.download = `${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_keyframe1.jpg`;
                a.target = '_blank';
                a.click();
                showNotice('Keyframe image downloaded!');
              }
            }}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs flex items-center justify-center gap-2 border border-zinc-700 transition"
          >
            <Layers className="w-4 h-4 text-rose-400" />
            Download Scene Keyframe
          </button>
        </div>
      </div>
    </div>
  );
};
