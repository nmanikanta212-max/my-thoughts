import React, { useState } from 'react';
import {
  X,
  Camera,
  Sliders,
  Volume2,
  Sparkles,
  RefreshCw,
  Upload,
  Clock,
  Eye,
  Check,
  Film,
  Layers,
} from 'lucide-react';
import { Shot, CameraAngle, CameraLens } from '../types/cinema';

interface ShotDetailModalProps {
  shot: Shot | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedShot: Shot) => void;
  onRegenerateVisual: (shotId: string, updatedPrompt: string) => Promise<void>;
}

const CAMERA_ANGLES: { angle: CameraAngle; description: string }[] = [
  { angle: 'Drone Aerial', description: "High altitude bird's-eye view establishing immense scale and geography." },
  { angle: 'Low Angle Hero', description: 'Looking up at the subject to convey majesty, dominance, and epic stature.' },
  { angle: 'Tracking Dolly In', description: 'Smooth cinematic forward push drawing the audience deeper into intimacy or peril.' },
  { angle: 'Dutch Angle', description: 'Tilted horizon creating psychological tension, disorientation, or adrenaline.' },
  { angle: 'Extreme Close-Up', description: 'Macro focus on eyes, hands, or critical artifacts conveying raw emotion.' },
  { angle: 'Crane Shot', description: 'Sweeping vertical elevator movement transitioning between intimacy and world scale.' },
  { angle: 'Steadicam Follow', description: 'Dynamic fluid tracking behind or alongside the character through environments.' },
  { angle: '360 Orbit', description: 'Smooth orbital rotation around the subject highlighting three-dimensional presence.' },
  { angle: 'Macro Focus Pull', description: 'Rack focus shifting sharp clarity from foreground to background.' },
  { angle: 'Over-the-Shoulder', description: 'Classic cinematic dialogue framing establishing conversational space.' },
  { angle: 'POV First-Person', description: 'Direct subjective point of view through the character eyes.' },
];

const CAMERA_LENSES: { lens: CameraLens; description: string }[] = [
  { lens: '16mm Ultra-Wide', description: 'Expansive field of view with slight edge curvature, perfect for grand landscapes.' },
  { lens: '24mm Anamorphic f/2.0', description: 'Classic Hollywood anamorphic with oval bokeh and horizontal blue flares.' },
  { lens: '35mm Panavision Prime', description: 'Natural human perspective with cinematic depth and crisp resolution.' },
  { lens: '50mm f/1.2 Master Prime', description: 'Eye-level standard with ultra-soft creamy background separation.' },
  { lens: '85mm Portrait Cine-Lens', description: 'Flattering facial compression with intense cinematic isolation.' },
  { lens: '200mm Telephoto Compression', description: 'Extreme planar compression pulling background mountains right behind character.' },
];

export const ShotDetailModal: React.FC<ShotDetailModalProps> = ({
  shot,
  isOpen,
  onClose,
  onSave,
  onRegenerateVisual,
}) => {
  if (!isOpen || !shot) return null;

  const [title, setTitle] = useState(shot.title);
  const [cameraAngle, setCameraAngle] = useState<CameraAngle>(shot.cameraAngle);
  const [cameraLens, setCameraLens] = useState<CameraLens>(shot.cameraLens);
  const [movementType, setMovementType] = useState(shot.cameraMovement.type);
  const [movementSpeed, setMovementSpeed] = useState(shot.cameraMovement.speed);
  const [zoomDelta, setZoomDelta] = useState(shot.cameraMovement.zoomDelta);
  const [duration, setDuration] = useState(shot.duration || 6);
  const [transition, setTransition] = useState(shot.transition);
  const [visualPrompt, setVisualPrompt] = useState(shot.visualPrompt);
  const [lighting, setLighting] = useState(shot.lighting);
  const [dialogue, setDialogue] = useState(shot.dialogue || '');
  const [speaker, setSpeaker] = useState(shot.speaker || 'Narrator');
  const [soundEffect, setSoundEffect] = useState(shot.soundEffect || '');
  const [imageUrl, setImageUrl] = useState(shot.customUploadedImage || shot.imageUrl || '');

  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);

  // Enhance prompt with AI
  const handleEnhancePrompt = async () => {
    setIsEnhancing(true);
    try {
      const res = await fetch('/api/enhance-shot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPrompt: visualPrompt,
          angle: cameraAngle,
        }),
      });
      const data = await res.json();
      if (data.success && data.data.enhancedPrompt) {
        setVisualPrompt(data.data.enhancedPrompt);
        if (data.data.suggestedLighting) {
          setLighting(data.data.suggestedLighting);
        }
      }
    } catch (err) {
      console.warn('Enhance failed:', err);
    } finally {
      setIsEnhancing(false);
    }
  };

  // Regenerate visual frame
  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      await onRegenerateVisual(shot.id, visualPrompt);
    } finally {
      setIsRegenerating(false);
    }
  };

  // Handle local image upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setImageUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const updated: Shot = {
      ...shot,
      title,
      cameraAngle,
      cameraLens,
      cameraMovement: {
        ...shot.cameraMovement,
        type: movementType,
        speed: movementSpeed,
        zoomDelta,
      },
      duration,
      transition,
      visualPrompt,
      lighting,
      dialogue,
      speaker,
      soundEffect,
      imageUrl,
      customUploadedImage: imageUrl.startsWith('data:') ? imageUrl : shot.customUploadedImage,
    };
    onSave(updated);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Camera className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Configure Sequence #{shot.shotNumber}: {title}
              </h3>
              <p className="text-xs text-zinc-400">
                Direct camera angle, lens optics, motion vector, lighting & narrative voice.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Visual Frame & Prompt Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Visual Frame Preview */}
            <div className="md:col-span-1 space-y-2">
              <label className="text-xs font-semibold text-zinc-200">Keyframe Visual</label>
              <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-black border border-zinc-800 relative group">
                {imageUrl ? (
                  <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 text-xs">
                    No image loaded
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleRegenerate}
                  disabled={isRegenerating}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-amber-400 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-amber-500/30 transition"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? 'animate-spin' : ''}`} />
                  {isRegenerating ? 'Generating...' : 'Free AI Regen'}
                </button>

                <label className="py-1.5 px-2.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700 transition">
                  <Upload className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>

            {/* Prompt & Title Inputs */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Shot Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-semibold text-zinc-300">
                    Visual Prompt (Optimized for 8K Photorealism)
                  </label>
                  <button
                    type="button"
                    onClick={handleEnhancePrompt}
                    disabled={isEnhancing}
                    className="text-[11px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    {isEnhancing ? 'Enhancing...' : 'Enhance with AI'}
                  </button>
                </div>
                <textarea
                  value={visualPrompt}
                  onChange={(e) => setVisualPrompt(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Lighting & Atmosphere</label>
                <input
                  type="text"
                  value={lighting}
                  onChange={(e) => setLighting(e.target.value)}
                  placeholder="e.g. Volumetric golden hour, cyan anamorphic rim flare"
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Camera Angles Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-400" /> Camera Angle & Framing Perspective
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {CAMERA_ANGLES.map(({ angle, description }) => {
                const isSelected = cameraAngle === angle;
                return (
                  <button
                    key={angle}
                    type="button"
                    onClick={() => setCameraAngle(angle)}
                    className={`p-2 rounded-xl text-left border transition ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 text-white ring-1 ring-amber-400'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-amber-300 truncate">{angle}</div>
                    <div className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-tight">
                      {description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lens Optics Selection */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-amber-400" /> Hollywood Lens Focal Length
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CAMERA_LENSES.map(({ lens, description }) => {
                const isSelected = cameraLens === lens;
                return (
                  <button
                    key={lens}
                    type="button"
                    onClick={() => setCameraLens(lens)}
                    className={`p-2.5 rounded-xl text-left border transition ${
                      isSelected
                        ? 'border-amber-400 bg-amber-500/10 text-white ring-1 ring-amber-400'
                        : 'border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:border-zinc-700 hover:text-white'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">{lens}</div>
                    <div className="text-[10px] text-zinc-400 line-clamp-2 mt-0.5 leading-tight">
                      {description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Camera Motion & Timing Parameters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-zinc-950/80 p-4 rounded-xl border border-zinc-800">
            <div>
              <label className="text-xs font-semibold text-zinc-300">Camera Movement Trajectory</label>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value as any)}
                className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="dolly_in">Dolly In (Forward Push)</option>
                <option value="dolly_out">Dolly Out (Backward Pull)</option>
                <option value="zoom_in">Slow Ken Burns Zoom In</option>
                <option value="zoom_out">Slow Ken Burns Zoom Out</option>
                <option value="pan_left">Pan Left (Horizontal Tracking)</option>
                <option value="pan_right">Pan Right (Horizontal Tracking)</option>
                <option value="tilt_up">Tilt Up (Crane Vertical)</option>
                <option value="tilt_down">Tilt Down (Crane Vertical)</option>
                <option value="orbital">Orbital 360 Rotation</option>
                <option value="static">Static Locked Tripod</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
                <span>Duration</span>
                <span className="text-amber-400 font-mono font-bold">{duration} seconds</span>
              </label>
              <input
                type="range"
                min="2"
                max="30"
                step="1"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                className="w-full mt-3 h-1.5 bg-zinc-800 rounded appearance-none accent-amber-400"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Transition to Next Sequence</label>
              <select
                value={transition}
                onChange={(e) => setTransition(e.target.value as any)}
                className="w-full mt-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="Dissolve">Cinematic Dissolve / Crossfade</option>
                <option value="Cut">Hard Direct Cut</option>
                <option value="Fade to Black">Fade to Black (Dramatic)</option>
                <option value="Whip Pan">Whip Pan Blur</option>
              </select>
            </div>
          </div>

          {/* Dialogue & Sound Effects */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300">
                Voiceover / Screenplay Dialogue
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={speaker}
                  onChange={(e) => setSpeaker(e.target.value)}
                  placeholder="Speaker name"
                  className="w-1/3 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
                <input
                  type="text"
                  value={dialogue}
                  onChange={(e) => setDialogue(e.target.value)}
                  placeholder="Dialogue or narrator voiceover line..."
                  className="w-2/3 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-cyan-400" /> Sound Design Cue
              </label>
              <input
                type="text"
                value={soundEffect}
                onChange={(e) => setSoundEffect(e.target.value)}
                placeholder="e.g. Cinematic brass braam, rain on metal, high-frequency hum"
                className="w-full px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 transition"
          >
            Save Sequence Changes
          </button>
        </div>
      </div>
    </div>
  );
};
