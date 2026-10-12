import React, { useState } from 'react';
import {
  X,
  Download,
  Film,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Tv,
  Layers,
  Sparkles,
} from 'lucide-react';
import { FilmProject } from '../types/cinema';
import { exportFilmTo4K, RESOLUTION_PRESETS } from '../utils/canvasRenderer';

interface ExportModalProps {
  project: FilmProject;
  isOpen: boolean;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  isOpen,
  onClose,
}) => {
  const [resolutionKey, setResolutionKey] = useState<string>('4k');
  const [fps, setFps] = useState<number>(24);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [progressStatus, setProgressStatus] = useState<string>('');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [fileSizeMb, setFileSizeMb] = useState<number | null>(null);

  if (!isOpen) return null;

  const totalDuration = project.shots.reduce((acc, s) => acc + (s.duration || 5), 0);
  const selectedRes = RESOLUTION_PRESETS[resolutionKey] || RESOLUTION_PRESETS['4k'];

  const handleStartExport = async () => {
    setIsExporting(true);
    setProgressPercent(0);
    setProgressStatus('Starting 4K render pipeline...');
    setDownloadUrl(null);

    try {
      const blob = await exportFilmTo4K({
        project,
        resolutionKey,
        fps,
        onProgress: (percent, status) => {
          setProgressPercent(percent);
          setProgressStatus(status);
        },
      });

      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
      setFileSizeMb(Math.round((blob.size / (1024 * 1024)) * 10) / 10);
    } catch (err: any) {
      console.error('Export error:', err);
      setProgressStatus(`Export failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl relative my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Download className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Export 4K Cinematic Master</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> ZERO CREDITS • FREE FOREVER
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Render at full {selectedRes.width}×{selectedRes.height} resolution with no watermarks or limits.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isExporting}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Resolution Options */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Tv className="w-3.5 h-3.5 text-amber-400" /> Export Resolution Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(RESOLUTION_PRESETS).map(([key, item]) => {
                const isSelected = resolutionKey === key;
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={isExporting}
                    onClick={() => setResolutionKey(key)}
                    className={`p-3 rounded-xl text-left border transition ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 text-white ring-1 ring-amber-400'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{item.label}</div>
                    <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      {key === '4k' ? 'Ultra HD Hollywood Grade' : 'Fast Render'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Framerate Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Film className="w-3.5 h-3.5 text-amber-400" /> Frame Rate (FPS)
            </label>
            <div className="flex gap-2">
              {[24, 30, 60].map((f) => (
                <button
                  key={f}
                  type="button"
                  disabled={isExporting}
                  onClick={() => setFps(f)}
                  className={`flex-1 py-2 px-3 rounded-xl border text-xs font-mono font-bold transition ${
                    fps === f
                      ? 'border-amber-400 bg-amber-500/10 text-amber-400'
                      : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  {f} FPS {f === 24 && '(Cinema Standard)'}
                </button>
              ))}
            </div>
          </div>

          {/* Project Summary Specs */}
          <div className="bg-zinc-950/80 p-3.5 rounded-xl border border-zinc-800 space-y-1.5 text-xs">
            <div className="flex justify-between text-zinc-400">
              <span>Sequences to Render:</span>
              <span className="text-white font-mono">{project.shots.length} Shots</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Total Duration:</span>
              <span className="text-amber-400 font-mono font-bold">{totalDuration} seconds</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Cinematic Color Grade:</span>
              <span className="text-white font-mono uppercase">{project.colorLut.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Cost / Credits:</span>
              <span className="text-emerald-400 font-mono font-bold">0 CREDITS (100% FREE)</span>
            </div>
          </div>

          {/* Progress Bar during render */}
          {isExporting && (
            <div className="space-y-2 bg-amber-950/20 border border-amber-500/30 rounded-xl p-4">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-300">Rendering 4K Canvas...</span>
                <span className="font-mono text-amber-400 font-bold">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-amber-300 transition-all duration-200"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <p className="text-[11px] text-zinc-400 font-mono truncate">{progressStatus}</p>
            </div>
          )}

          {/* Download Complete Card */}
          {downloadUrl && (
            <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                <CheckCircle className="w-4 h-4" />
                4K Master Video File Ready for Download ({fileSizeMb} MB)
              </div>
              <a
                href={downloadUrl}
                download={`${project.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}_4k.webm`}
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 hover:from-emerald-400 hover:to-emerald-300 text-zinc-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
              >
                <Download className="w-4 h-4 text-zinc-950" />
                Download 4K Video File (.webm)
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            Close
          </button>
          {!downloadUrl && (
            <button
              type="button"
              onClick={handleStartExport}
              disabled={isExporting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              {isExporting ? 'Rendering 4K Frames...' : 'Start 4K Video Export'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
