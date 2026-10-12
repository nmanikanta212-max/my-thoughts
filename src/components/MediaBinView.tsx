import React from 'react';
import {
  Layers,
  Upload,
  Camera,
  Film,
  Download,
  Eye,
  CheckCircle,
  FileImage,
  Sparkles,
} from 'lucide-react';
import { FilmProject, Shot } from '../types/cinema';
import { SupportedLanguage, getTranslation } from '../utils/i18n';

interface MediaBinViewProps {
  project: FilmProject;
  currentLanguage: SupportedLanguage;
  onSelectShot: (shot: Shot) => void;
  onUploadAsset: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const MediaBinView: React.FC<MediaBinViewProps> = ({
  project,
  currentLanguage,
  onSelectShot,
  onUploadAsset,
}) => {
  const t = (key: string) => getTranslation(currentLanguage, key);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" /> {t('media_assets')}
            </h3>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-bold">
              {project.shots.length} SCENE ASSETS • RAW 4K
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Master asset repository for all storyboard frames, uploaded character faces, and audio stem tracks.
          </p>
        </div>

        <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs cursor-pointer shadow-md transition active:scale-95">
          <Upload className="w-4 h-4 text-zinc-950" />
          <span>Import Custom Footage / Image</span>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={onUploadAsset}
            className="hidden"
          />
        </label>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {project.shots.map((shot, idx) => {
          const displayUrl = shot.customUploadedImage || shot.imageUrl;
          return (
            <div
              key={shot.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden hover:border-amber-500/50 transition flex flex-col justify-between group"
            >
              <div className="relative aspect-[16/9] w-full bg-black overflow-hidden">
                {displayUrl ? (
                  <img
                    src={displayUrl}
                    alt={shot.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                    Rendering...
                  </div>
                )}
                <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-white font-bold">
                  SEQUENCE #{idx + 1}
                </span>
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-amber-400">
                  {shot.duration}s
                </span>
              </div>

              <div className="p-3 space-y-2">
                <div>
                  <h4 className="text-xs font-bold text-white truncate">{shot.title}</h4>
                  <div className="text-[10px] text-zinc-400 font-mono flex items-center justify-between mt-0.5">
                    <span>{shot.cameraAngle}</span>
                    <span className="text-zinc-500">{shot.cameraLens}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 pt-1">
                  <button
                    onClick={() => onSelectShot(shot)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-[11px] font-medium flex items-center justify-center gap-1 transition"
                  >
                    <Eye className="w-3 h-3 text-amber-400" /> Inspect
                  </button>
                  {displayUrl && (
                    <a
                      href={displayUrl}
                      download={`${shot.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}.jpg`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition"
                      title="Download image"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
