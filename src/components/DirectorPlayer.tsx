import React, { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  SkipForward,
  SkipBack,
  Sliders,
  Sparkles,
  Camera,
  Film,
  Aperture,
  Tv,
  Check,
  Download,
  Activity,
  Layers,
} from 'lucide-react';
import { FilmProject, Shot, ColorLut, AspectRatio } from '../types/cinema';
import { drawCinematicFrame, preloadImage } from '../utils/canvasRenderer';
import { audioSynthesizer, speakDialogue, stopDialogue } from '../utils/audioSynthesizer';
import { SupportedLanguage, getTranslation } from '../utils/i18n';

interface DirectorPlayerProps {
  project: FilmProject;
  onUpdateProject: (updated: FilmProject) => void;
  onEditShot: (shot: Shot) => void;
  onOpenExport: () => void;
  onSnapshotCurrentFrame: () => void;
  currentLanguage: SupportedLanguage;
}

export const DirectorPlayer: React.FC<DirectorPlayerProps> = ({
  project,
  onUpdateProject,
  onEditShot,
  onOpenExport,
  onSnapshotCurrentFrame,
  currentLanguage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentShotIndex, setCurrentShotIndex] = useState<number>(0);
  const [shotProgress, setShotProgress] = useState<number>(0); // 0 to 1
  const [currentTime, setCurrentTime] = useState<number>(0); // in seconds
  const [isMuted, setIsMuted] = useState<boolean>(!project.audioEnabled);
  const [volume, setVolume] = useState<number>(0.75);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(true);
  const [loadedImages, setLoadedImages] = useState<Map<string, HTMLImageElement>>(new Map());
  const [activeLut, setActiveLut] = useState<ColorLut>(project.colorLut);
  const [activeAspectRatio, setActiveAspectRatio] = useState<AspectRatio>(project.aspectRatio);

  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(0);

  const t = (key: string) => getTranslation(currentLanguage, key);

  // Total duration of project in seconds
  const totalDuration = project.shots.reduce((acc, s) => acc + (s.duration || 5), 0);

  // Preload images whenever project shots change
  useEffect(() => {
    const map = new Map<string, HTMLImageElement>();
    let isCancelled = false;

    project.shots.forEach((shot) => {
      const url = shot.customUploadedImage || shot.imageUrl || '';
      if (url) {
        preloadImage(url).then((img) => {
          if (!isCancelled) {
            map.set(shot.id, img);
            setLoadedImages(new Map(map));
          }
        });
      }
    });

    return () => {
      isCancelled = true;
    };
  }, [project.shots]);

  useEffect(() => {
    setActiveLut(project.colorLut);
    setActiveAspectRatio(project.aspectRatio);
  }, [project.colorLut, project.aspectRatio]);

  // Handle Playback Loop
  useEffect(() => {
    if (!isPlaying) {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      audioSynthesizer.stop();
      stopDialogue();
      return;
    }

    if (!isMuted) {
      audioSynthesizer.playPreset(project.soundtrackPreset);
      audioSynthesizer.setVolume(volume);
    }

    lastTimeRef.current = performance.now();

    const loop = (now: number) => {
      const delta = (now - lastTimeRef.current) / 1000;
      lastTimeRef.current = now;

      setCurrentTime((prevTime) => {
        let newTime = prevTime + delta;

        if (newTime >= totalDuration) {
          if (isLooping) {
            newTime = 0;
            setCurrentShotIndex(0);
            setShotProgress(0);
            return 0;
          } else {
            setIsPlaying(false);
            return totalDuration;
          }
        }

        let accumulated = 0;
        let foundIndex = 0;
        let progressInFound = 0;

        for (let i = 0; i < project.shots.length; i++) {
          const s = project.shots[i];
          const dur = s.duration || 5;
          if (newTime >= accumulated && newTime < accumulated + dur) {
            foundIndex = i;
            progressInFound = (newTime - accumulated) / dur;
            break;
          }
          accumulated += dur;
        }

        if (foundIndex !== currentShotIndex) {
          setCurrentShotIndex(foundIndex);
          const nextShot = project.shots[foundIndex];
          if (nextShot) {
            audioSynthesizer.triggerImpact('braam');
            if (project.voiceoverEnabled && nextShot.dialogue && !isMuted) {
              speakDialogue(nextShot.dialogue, project.voicePersona || 'trailer_baritone', project.narratorVoiceRate, project.narratorVoicePitch);
            }
          }
        }

        setShotProgress(progressInFound);
        return newTime;
      });

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, isMuted, isLooping, totalDuration, project.shots, currentShotIndex, project.soundtrackPreset, project.voiceoverEnabled, volume]);

  // Draw current frame on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentShot = project.shots[currentShotIndex] || project.shots[0];
    if (!currentShot) return;

    const nextShot = project.shots[currentShotIndex + 1];
    const img = loadedImages.get(currentShot.id);
    const nextImg = nextShot ? loadedImages.get(nextShot.id) : null;

    let transitionProgress = 0;
    if (currentShot.transition === 'Dissolve' && nextShot && shotProgress > 0.8) {
      transitionProgress = (shotProgress - 0.8) / 0.2;
    }

    drawCinematicFrame({
      ctx,
      width: canvas.width,
      height: canvas.height,
      shot: currentShot,
      nextShot,
      progress: shotProgress,
      project: {
        ...project,
        colorLut: activeLut,
      },
      image: img,
      nextImage: nextImg,
      transitionProgress,
    });
  }, [currentShotIndex, shotProgress, loadedImages, project, activeLut]);

  const handleScrub = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newT = parseFloat(e.target.value);
    setCurrentTime(newT);

    let acc = 0;
    for (let i = 0; i < project.shots.length; i++) {
      const dur = project.shots[i].duration || 5;
      if (newT >= acc && newT <= acc + dur) {
        setCurrentShotIndex(i);
        setShotProgress((newT - acc) / dur);
        break;
      }
      acc += dur;
    }
  };

  const handleNextShot = () => {
    if (currentShotIndex < project.shots.length - 1) {
      const nextIdx = currentShotIndex + 1;
      let acc = 0;
      for (let i = 0; i < nextIdx; i++) {
        acc += project.shots[i].duration || 5;
      }
      setCurrentShotIndex(nextIdx);
      setCurrentTime(acc);
      setShotProgress(0);
    }
  };

  const handlePrevShot = () => {
    if (currentShotIndex > 0) {
      const prevIdx = currentShotIndex - 1;
      let acc = 0;
      for (let i = 0; i < prevIdx; i++) {
        acc += project.shots[i].duration || 5;
      }
      setCurrentShotIndex(prevIdx);
      setCurrentTime(acc);
      setShotProgress(0);
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  const formatTimecode = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    const frames = Math.floor((seconds % 1) * 24);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const currentShot = project.shots[currentShotIndex] || project.shots[0];

  const getAspectRatioClasses = () => {
    switch (activeAspectRatio) {
      case '2.39:1':
        return 'aspect-[2.39/1]';
      case '16:9':
        return 'aspect-[16/9]';
      case '9:16':
        return 'aspect-[9/16] max-h-[720px] mx-auto';
      case '4:3':
        return 'aspect-[4/3]';
      default:
        return 'aspect-[2.39/1]';
    }
  };

  return (
    <div className="space-y-4">
      {/* Film Title & Metadata Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-2.5 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase text-amber-400 font-semibold tracking-wider">
              {project.genre}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-zinc-400 font-medium">{project.durationMode.replace('_', ' ').toUpperCase()}</span>
            <span className="text-zinc-600">•</span>
            <span className="text-xs text-emerald-400 font-mono font-semibold">0 CREDITS / FREE 4K</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">{project.title}</h2>
        </div>

        {/* Live Cinema Monitor LUT & Download Quick Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-1 rounded-lg">
            <Aperture className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] text-zinc-400 font-mono">{t('lut_label')}</span>
            <select
              value={activeLut}
              onChange={(e) => {
                const lut = e.target.value as ColorLut;
                setActiveLut(lut);
                onUpdateProject({ ...project, colorLut: lut });
              }}
              className="bg-transparent text-[11px] text-white focus:outline-none cursor-pointer"
            >
              <option value="teal_orange">Teal & Orange (Blockbuster)</option>
              <option value="bleach_bypass">Bleach Bypass (Matrix/Gritty)</option>
              <option value="noir_monochrome">Noir (B&W High Contrast)</option>
              <option value="cyber_neon">Cyber Neon (Neon Glow)</option>
              <option value="golden_hour">Golden Hour (Warm Amber)</option>
              <option value="kodak_vintage">1970s Panavision 35mm</option>
              <option value="sci_fi_matrix">Sci-Fi Matrix Emerald</option>
              <option value="natural">Natural Neutral</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-zinc-950/80 border border-zinc-800 px-2 py-1 rounded-lg">
            <Tv className="w-3.5 h-3.5 text-amber-400" />
            <select
              value={activeAspectRatio}
              onChange={(e) => {
                const ratio = e.target.value as AspectRatio;
                setActiveAspectRatio(ratio);
                onUpdateProject({ ...project, aspectRatio: ratio });
              }}
              className="bg-transparent text-[11px] text-white focus:outline-none cursor-pointer"
            >
              <option value="2.39:1">2.39:1 Anamorphic Scope</option>
              <option value="16:9">16:9 Widescreen</option>
              <option value="9:16">9:16 Vertical Reel</option>
              <option value="4:3">4:3 IMAX Classic</option>
            </select>
          </div>

          {/* Quick Snapshot 4K Still Button */}
          <button
            onClick={onSnapshotCurrentFrame}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold rounded-lg border border-zinc-700 transition"
            title="Save current frame as 4K lossless PNG"
          >
            <Camera className="w-3.5 h-3.5 text-cyan-400" />
            <span>{t('snapshot_4k')}</span>
          </button>
        </div>
      </div>

      {/* Main Cinema Monitor Container */}
      <div
        ref={containerRef}
        className="relative bg-black rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl group"
      >
        {/* Real-time 4K Canvas */}
        <div className={`w-full ${getAspectRatioClasses()} relative flex items-center justify-center bg-black overflow-hidden`}>
          <canvas
            ref={canvasRef}
            width={1920}
            height={1080}
            className="w-full h-full object-contain"
          />

          {/* Technical Director Overlay */}
          <div className="absolute top-4 left-4 z-20 flex items-center gap-2 pointer-events-none">
            <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono text-amber-400 flex items-center gap-1.5 shadow">
              <Camera className="w-3 h-3 text-amber-400" />
              {currentShot?.cameraAngle}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-300 shadow">
              {currentShot?.cameraLens}
            </span>
            <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono text-emerald-400 shadow">
              MOVE: {currentShot?.cameraMovement.type.toUpperCase().replace('_', ' ')}
            </span>
          </div>

          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 pointer-events-none">
            {/* Audio VU Activity indicator */}
            <span className="px-2 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[10px] font-mono text-cyan-400 flex items-center gap-1">
              <Activity className="w-3 h-3 text-cyan-400" />
              VU: {isPlaying && !isMuted ? '-12 dB' : 'MUTED'}
            </span>

            <span className="px-2.5 py-1 rounded-md bg-red-600/90 text-white font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 shadow">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              {t('rec_live')}
            </span>

            <span className="px-2.5 py-1 rounded-md bg-black/75 backdrop-blur-md border border-white/10 text-[11px] font-mono text-zinc-200 shadow">
              SHOT {currentShotIndex + 1}/{project.shots.length}
            </span>
          </div>
        </div>

        {/* Video Controls Bar */}
        <div className="bg-zinc-950/95 border-t border-zinc-800/80 p-3 flex flex-col gap-2">
          {/* Timeline Seekbar */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-amber-400 font-semibold w-16 text-right">
              {formatTimecode(currentTime)}
            </span>
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min="0"
                max={totalDuration || 1}
                step="0.05"
                value={currentTime}
                onChange={handleScrub}
                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-500 hover:accent-amber-400 transition"
              />
            </div>
            <span className="text-xs font-mono text-zinc-400 w-16">
              {formatTimecode(totalDuration)}
            </span>
          </div>

          {/* Button Toolbar */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevShot}
                disabled={currentShotIndex === 0}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition"
                title="Previous Shot"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 flex items-center justify-center font-bold shadow-lg shadow-amber-500/20 active:scale-95 transition"
                title={isPlaying ? 'Pause' : 'Play Cinema'}
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-current" /> : <Play className="w-5 h-5 fill-current ml-0.5" />}
              </button>

              <button
                onClick={handleNextShot}
                disabled={currentShotIndex === project.shots.length - 1}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 transition"
                title="Next Shot"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  setCurrentTime(0);
                  setCurrentShotIndex(0);
                  setShotProgress(0);
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                title="Return to beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsLooping(!isLooping)}
                className={`px-2 py-1 text-[11px] rounded font-mono font-medium border transition ${
                  isLooping
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                    : 'text-zinc-500 border-zinc-800 hover:text-zinc-300'
                }`}
              >
                LOOP
              </button>
            </div>

            {/* Current Shot Information */}
            <div className="hidden md:flex items-center gap-3 bg-zinc-900/60 border border-zinc-800/80 px-3 py-1.5 rounded-xl">
              <span className="text-xs font-semibold text-zinc-200 truncate max-w-xs">
                Shot {currentShotIndex + 1}: {currentShot?.title}
              </span>
              <button
                onClick={() => currentShot && onEditShot(currentShot)}
                className="text-[11px] text-amber-400 hover:text-amber-300 hover:underline flex items-center gap-1 font-medium"
              >
                <Sliders className="w-3 h-3" />
                {t('edit_shot')}
              </button>
            </div>

            {/* Audio & Export Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const newMuted = !isMuted;
                  setIsMuted(newMuted);
                  if (newMuted) {
                    audioSynthesizer.stop();
                  } else if (isPlaying) {
                    audioSynthesizer.playPreset(project.soundtrackPreset);
                  }
                }}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => {
                  const v = parseFloat(e.target.value);
                  setVolume(v);
                  audioSynthesizer.setVolume(v);
                }}
                className="w-14 h-1.5 bg-zinc-800 rounded appearance-none accent-amber-400"
              />

              <button
                onClick={onOpenExport}
                className="p-1.5 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-zinc-800 transition"
                title="Export 4K Master Video"
              >
                <Download className="w-4 h-4" />
              </button>

              <button
                onClick={toggleFullscreen}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
                title="Fullscreen Monitor"
              >
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Shot Strip Quick Navigation */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
            <Film className="w-3.5 h-3.5 text-amber-400" /> Keyframe Sequences ({project.shots.length} Shots • {totalDuration}s)
          </span>
          <span className="text-[11px] text-zinc-500">Click any card to preview shot angle</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
          {project.shots.map((shot, idx) => {
            const isSelected = idx === currentShotIndex;
            const img = loadedImages.get(shot.id);
            return (
              <div
                key={shot.id}
                onClick={() => {
                  let acc = 0;
                  for (let i = 0; i < idx; i++) {
                    acc += project.shots[i].duration || 5;
                  }
                  setCurrentShotIndex(idx);
                  setCurrentTime(acc);
                  setShotProgress(0);
                }}
                className={`group relative rounded-xl border p-2 cursor-pointer transition-all duration-200 overflow-hidden ${
                  isSelected
                    ? 'border-amber-400 bg-amber-950/20 shadow-md shadow-amber-500/10 ring-1 ring-amber-400'
                    : 'border-zinc-800 bg-zinc-900/60 hover:border-zinc-700 hover:bg-zinc-900'
                }`}
              >
                <div className="relative aspect-[16/9] w-full bg-zinc-950 rounded-lg overflow-hidden mb-2">
                  {img ? (
                    <img
                      src={img.src}
                      alt={shot.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-900 text-zinc-600 text-[10px]">
                      Rendering...
                    </div>
                  )}
                  <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white font-bold">
                    #{idx + 1}
                  </span>
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-amber-400">
                    {shot.duration}s
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-[11px] font-medium text-white truncate">
                    {shot.title}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span className="text-amber-400/90 font-mono">{shot.cameraAngle}</span>
                    <span className="text-zinc-500">{shot.transition}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
