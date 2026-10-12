import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Camera,
  Sliders,
  Volume2,
  MessageSquare,
  Clock,
  Sparkles,
  Layers,
  Check,
  Eye,
  Upload,
} from 'lucide-react';
import { FilmProject, Shot, CameraAngle, CameraLens, CameraMovement } from '../types/cinema';

interface TimelineEditorProps {
  project: FilmProject;
  onUpdateProject: (updated: FilmProject) => void;
  onEditShotDetails: (shot: Shot) => void;
  onRegenerateShotImage: (shotId: string) => Promise<void>;
}

export const TimelineEditor: React.FC<TimelineEditorProps> = ({
  project,
  onUpdateProject,
  onEditShotDetails,
  onRegenerateShotImage,
}) => {
  const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

  const totalDuration = project.shots.reduce((acc, s) => acc + (s.duration || 5), 0);

  // Move shot left
  const moveShotLeft = (index: number) => {
    if (index <= 0) return;
    const newShots = [...project.shots];
    const temp = newShots[index - 1];
    newShots[index - 1] = newShots[index];
    newShots[index] = temp;
    // Recalculate shot numbers
    newShots.forEach((s, idx) => (s.shotNumber = idx + 1));
    onUpdateProject({ ...project, shots: newShots });
  };

  // Move shot right
  const moveShotRight = (index: number) => {
    if (index >= project.shots.length - 1) return;
    const newShots = [...project.shots];
    const temp = newShots[index + 1];
    newShots[index + 1] = newShots[index];
    newShots[index] = temp;
    newShots.forEach((s, idx) => (s.shotNumber = idx + 1));
    onUpdateProject({ ...project, shots: newShots });
  };

  // Duplicate shot
  const duplicateShot = (shot: Shot, index: number) => {
    const newShot: Shot = {
      ...shot,
      id: `shot-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      shotNumber: index + 2,
      title: `${shot.title} (Alt Angle)`,
    };
    const newShots = [...project.shots];
    newShots.splice(index + 1, 0, newShot);
    newShots.forEach((s, idx) => (s.shotNumber = idx + 1));
    onUpdateProject({ ...project, shots: newShots });
  };

  // Delete shot
  const deleteShot = (id: string) => {
    if (project.shots.length <= 1) {
      alert('A film project must have at least one shot.');
      return;
    }
    const newShots = project.shots.filter((s) => s.id !== id);
    newShots.forEach((s, idx) => (s.shotNumber = idx + 1));
    onUpdateProject({ ...project, shots: newShots });
  };

  // Add brand new shot
  const addNewShot = () => {
    const nextNum = project.shots.length + 1;
    const newShot: Shot = {
      id: `shot-${Date.now()}`,
      shotNumber: nextNum,
      title: `Sequence ${nextNum}: Dramatic Perspective`,
      cameraAngle: 'Tracking Dolly In',
      cameraLens: '35mm Panavision Prime',
      cameraMovement: {
        type: 'dolly_in',
        speed: 1.0,
        zoomDelta: 0.2,
        panDeltaX: 0,
        panDeltaY: 0,
      },
      lighting: 'Volumetric cinematic rim lighting with deep shadows',
      sceneDescription: `${project.title}, sequence ${nextNum}, photorealistic 8K cinematic frame`,
      visualPrompt: `Masterpiece cinematic 8k film still, ${project.title}, sequence ${nextNum}, dramatic lighting, 35mm film grain, anamorphic lens flare`,
      imageUrl: project.shots[0]?.imageUrl || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
      characterInShot: project.characters[0]?.name || 'Protagonist',
      dialogue: 'The journey takes an unexpected turn.',
      speaker: 'Narrator',
      soundEffect: 'Low frequency cinematic rumble',
      duration: 6,
      transition: 'Dissolve',
    };
    const newShots = [...project.shots, newShot];
    onUpdateProject({ ...project, shots: newShots });
  };

  // Change individual shot duration
  const updateDuration = (id: string, delta: number) => {
    const newShots = project.shots.map((s) => {
      if (s.id === id) {
        const nextDur = Math.max(2, Math.min(60, (s.duration || 5) + delta));
        return { ...s, duration: nextDur };
      }
      return s;
    });
    onUpdateProject({ ...project, shots: newShots });
  };

  // Trigger regenerate image for shot
  const handleRegenerate = async (shotId: string) => {
    setRegeneratingId(shotId);
    try {
      await onRegenerateShotImage(shotId);
    } finally {
      setRegeneratingId(null);
    }
  };

  // Handle local image file upload for a specific shot
  const handleFileUpload = (shotId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        const newShots = project.shots.map((s) => {
          if (s.id === shotId) {
            return { ...s, customUploadedImage: dataUrl, imageUrl: dataUrl };
          }
          return s;
        });
        onUpdateProject({ ...project, shots: newShots });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Multi-Track Header */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" /> Storyboard & Multi-Track Timeline
            </h3>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
              {project.shots.length} Sequences
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-0.5">
            Total Film Duration: <span className="text-white font-mono font-semibold">{totalDuration} seconds</span> (Can extend up to 30 min / 1,800s)
          </p>
        </div>

        <button
          onClick={addNewShot}
          className="flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 shadow-md shadow-amber-500/20 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" /> Add Next Cinematic Sequence
        </button>
      </div>

      {/* Visual Multi-Track Sequencer Graphic */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-3 space-y-2">
        <div className="text-[11px] font-mono text-zinc-400 flex items-center justify-between">
          <span className="uppercase tracking-wider">Multi-Track Synchronizer</span>
          <span className="text-emerald-400 font-mono">0 CREDITS / ZERO COST PIPELINE</span>
        </div>

        {/* Visual Timeline Bar */}
        <div className="w-full h-8 bg-zinc-900 rounded-lg overflow-hidden flex border border-zinc-800">
          {project.shots.map((shot, idx) => {
            const widthPct = ((shot.duration || 5) / (totalDuration || 1)) * 100;
            const colors = [
              'bg-blue-600/40 border-r border-blue-400/30',
              'bg-amber-600/40 border-r border-amber-400/30',
              'bg-purple-600/40 border-r border-purple-400/30',
              'bg-emerald-600/40 border-r border-emerald-400/30',
              'bg-rose-600/40 border-r border-rose-400/30',
            ];
            const colorClass = colors[idx % colors.length];

            return (
              <div
                key={shot.id}
                style={{ width: `${widthPct}%` }}
                className={`h-full ${colorClass} px-1.5 py-1 flex items-center justify-between text-[10px] text-white font-mono truncate hover:brightness-125 transition cursor-pointer`}
                title={`Shot ${idx + 1}: ${shot.title} (${shot.duration}s)`}
                onClick={() => onEditShotDetails(shot)}
              >
                <span className="truncate">#{idx + 1} {shot.cameraAngle.split(' ')[0]}</span>
                <span className="text-amber-300 ml-1">{shot.duration}s</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Storyboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {project.shots.map((shot, index) => {
          const isRegen = regeneratingId === shot.id;
          const displayUrl = shot.customUploadedImage || shot.imageUrl;

          return (
            <div
              key={shot.id}
              className="bg-zinc-900/80 border border-zinc-800 rounded-xl overflow-hidden hover:border-zinc-700 transition flex flex-col justify-between group"
            >
              {/* Card Header & Tools */}
              <div className="p-3 border-b border-zinc-800/80 flex items-center justify-between bg-zinc-950/60">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-500/20 border border-amber-500/40 text-amber-400 text-xs font-mono font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-xs font-semibold text-white truncate max-w-[140px]">
                    {shot.title}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveShotLeft(index)}
                    disabled={index === 0}
                    className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20 hover:bg-zinc-800"
                    title="Move earlier"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => moveShotRight(index)}
                    disabled={index === project.shots.length - 1}
                    className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20 hover:bg-zinc-800"
                    title="Move later"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => duplicateShot(shot, index)}
                    className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800"
                    title="Duplicate shot"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteShot(shot.id)}
                    className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800"
                    title="Delete shot"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Shot Visual Preview */}
              <div className="relative aspect-[16/9] w-full bg-black overflow-hidden">
                {displayUrl ? (
                  <img
                    src={displayUrl}
                    alt={shot.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 text-xs gap-2">
                    <Camera className="w-6 h-6 text-zinc-600" />
                    <span>Rendering Frame...</span>
                  </div>
                )}

                {/* Overlaid Badges */}
                <div className="absolute top-2 left-2 flex items-center gap-1.5 pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-amber-400 border border-white/10">
                    {shot.cameraAngle}
                  </span>
                </div>

                <div className="absolute top-2 right-2 pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-mono text-zinc-300 border border-white/10">
                    {shot.cameraLens}
                  </span>
                </div>

                {/* Regenerate or Upload Local Image Action Overlays */}
                <div className="absolute bottom-2 right-2 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
                  <label
                    className="p-1.5 rounded-lg bg-black/80 hover:bg-zinc-800 text-zinc-300 hover:text-white cursor-pointer border border-white/10 transition"
                    title="Upload Custom Shot Image / Frame"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(shot.id, e)}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => handleRegenerate(shot.id)}
                    disabled={isRegen}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/80 hover:bg-zinc-800 text-amber-400 border border-amber-500/30 text-[10px] font-medium transition"
                    title="Regenerate with Free AI Engine"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRegen ? 'animate-spin' : ''}`} />
                    {isRegen ? 'Generating...' : 'Free Regen'}
                  </button>
                </div>
              </div>

              {/* Shot Details & Controls */}
              <div className="p-3 space-y-2.5 flex-1">
                {/* Duration Control */}
                <div className="flex items-center justify-between text-xs bg-zinc-950/60 p-2 rounded-lg border border-zinc-800">
                  <span className="text-zinc-400 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3 text-amber-400" /> Duration:
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateDuration(shot.id, -1)}
                      className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="font-mono text-amber-400 font-bold w-7 text-center">
                      {shot.duration}s
                    </span>
                    <button
                      onClick={() => updateDuration(shot.id, 1)}
                      className="w-5 h-5 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Camera Movement */}
                <div className="text-[11px] text-zinc-300 flex items-center justify-between">
                  <span className="text-zinc-500">Camera Move:</span>
                  <span className="font-mono text-emerald-400 capitalize">
                    {shot.cameraMovement.type.replace('_', ' ')} (x{shot.cameraMovement.speed})
                  </span>
                </div>

                {/* Dialogue Line */}
                {shot.dialogue && (
                  <div className="text-[11px] text-zinc-300 bg-zinc-950/50 p-2 rounded-lg border border-zinc-800/80">
                    <div className="text-[10px] text-amber-400 font-semibold mb-0.5 flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {shot.speaker || 'Narrator'}:
                    </div>
                    <p className="italic text-zinc-300 line-clamp-2">"{shot.dialogue}"</p>
                  </div>
                )}

                {/* Sound FX Cue */}
                {shot.soundEffect && (
                  <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span className="truncate">{shot.soundEffect}</span>
                  </div>
                )}
              </div>

              {/* Edit Details Action */}
              <div className="p-3 pt-0">
                <button
                  onClick={() => onEditShotDetails(shot)}
                  className="w-full py-1.5 px-3 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center justify-center gap-1.5 transition"
                >
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  Configure Camera & Script
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
