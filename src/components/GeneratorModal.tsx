import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Film,
  Camera,
  Layers,
  ShieldCheck,
  Upload,
  User,
  Music,
  Tv,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import {
  FilmProject,
  DurationMode,
  VisualStyle,
  AspectRatio,
  SoundtrackPreset,
} from '../types/cinema';

interface GeneratorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilmGenerated: (project: FilmProject) => void;
}

const SAMPLE_PROMPTS = [
  'Interstellar deep space research vessel discovering an ancient Dyson sphere inside a nebula',
  'Cyberpunk 2099 detective hunting rogue synthetic AI along rain-slicked Tokyo skyscrapers',
  'Ancient Celtic druid defending sacred bioluminescent redwood grove from an iron empire',
  'Deep sea research submersible exploring Mariana Trench discovering colossal abyssal ruins',
  'Post-apocalyptic wanderer and robot dog crossing golden sand dunes under two twin moons',
];

export const GeneratorModal: React.FC<GeneratorModalProps> = ({
  isOpen,
  onClose,
  onFilmGenerated,
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [durationTarget, setDurationTarget] = useState<DurationMode>('trailer_2min');
  const [visualStyle, setVisualStyle] = useState<VisualStyle>('cinematic_photoreal');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('2.39:1');
  const [soundtrack, setSoundtrack] = useState<SoundtrackPreset>('hans_zimmer_epic');
  const [characterName, setCharacterName] = useState<string>('Commander Vance');
  const [characterTraits, setCharacterTraits] = useState<string>('Weathered flight suit, focused eyes, titanium visor');
  const [referenceImage, setReferenceImage] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setReferenceImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setError('Please provide a prompt or film concept.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setLoadingStep('Scripting screenplay, story beats & camera angles with AI Director...');

    try {
      const response = await fetch('/api/generate-screenplay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          durationTarget,
          style: visualStyle,
          aspectRatio,
          characters: characterName
            ? [{ name: characterName, visualDescription: characterTraits }]
            : [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate film: ${response.statusText}`);
      }

      const resData = await response.json();
      if (!resData.success || !resData.data) {
        throw new Error('Invalid screenplay response from server');
      }

      const screenplay = resData.data;

      setLoadingStep('Synthesizing cinematic 4K storyboard keyframes & camera trajectories (Zero credits)...');

      // Populate visuals for each shot using free AI proxy or Unsplash/Pollinations
      const shotsWithImages = screenplay.shots.map((shot: any, idx: number) => {
        const seed = Math.floor(Math.random() * 899999) + 100000;
        const encodedVisual = encodeURIComponent(
          `${visualStyle}, ${shot.visualPrompt || shot.sceneDescription}, ${shot.cameraAngle}, 8k cinema still`
        );
        // Free zero-credit visual generation URL via Pollinations
        const freeImageUrl = `/api/proxy-image?prompt=${encodedVisual}&seed=${seed}&width=1920&height=1080&model=flux`;

        return {
          ...shot,
          id: shot.id || `shot-${idx + 1}`,
          shotNumber: idx + 1,
          imageUrl: freeImageUrl,
          customUploadedImage: idx === 0 && referenceImage ? referenceImage : undefined,
          duration: shot.duration || 6,
          transition: shot.transition || (idx === screenplay.shots.length - 1 ? 'Fade to Black' : 'Dissolve'),
        };
      });

      const newProject: FilmProject = {
        id: `film-${Date.now()}`,
        title: screenplay.title || prompt.slice(0, 30),
        logline: screenplay.logline || `An epic cinematic story about ${prompt}`,
        synopsis: screenplay.synopsis || `Cinematic film exploring ${prompt}`,
        genre: screenplay.genre || 'Cinematic Film',
        style: visualStyle,
        durationMode: durationTarget,
        aspectRatio,
        colorLut: visualStyle === 'cyberpunk_noir' ? 'cyber_neon' : 'teal_orange',
        filmGrain: 0.18,
        letterbox: aspectRatio === '2.39:1',
        soundtrackTheme: screenplay.soundtrackTheme || 'Orchestral cinematic score',
        soundtrackPreset: soundtrack,
        characters: screenplay.characters || [
          {
            id: 'char-1',
            name: characterName || 'Protagonist',
            tagline: 'Main Character',
            visualDescription: characterTraits || 'Consistent visual traits',
            seed: 450123,
            referenceImage: referenceImage || undefined,
          },
        ],
        shots: shotsWithImages,
        audioEnabled: true,
        voiceoverEnabled: true,
        voicePersona: 'trailer_baritone',
        narratorVoiceRate: 0.9,
        narratorVoicePitch: 0.82,
        musicVolume: 0.7,
        voiceVolume: 0.9,
        sfxVolume: 0.8,
      };

      onFilmGenerated(newProject);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate film. Please try again.');
    } finally {
      setIsLoading(false);
      setLoadingStep('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl relative my-8">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Generate AI Cinematic Film</h3>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> ZERO CREDITS • 100% FREE
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Transforms text, images & character bibles into 4K realistic scenes with dynamic camera angles.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-200 flex items-center justify-between">
              <span>Text Prompt / Story Logline</span>
              <span className="text-[11px] text-zinc-500 font-normal">Supports full storyboards, film ideas & scenes</span>
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your film premise, scene, or trailer vision (e.g., An intrepid astronaut in an orange flight suit landing on a crystalline exoplanet during a double solar eclipse...)"
              rows={3}
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white text-xs placeholder:text-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
            />

            {/* Quick Inspiration Chips */}
            <div className="space-y-1">
              <span className="text-[10px] text-zinc-500 font-mono">QUICK IDEAS:</span>
              <div className="flex flex-wrap gap-1.5">
                {SAMPLE_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(p)}
                    className="text-[10px] px-2 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition truncate max-w-xs"
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Duration & Production Format */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-amber-400" /> Duration & Production Target
              </label>
              <select
                value={durationTarget}
                onChange={(e) => setDurationTarget(e.target.value as DurationMode)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="teaser_30s">30-Second Cinematic Teaser (4 Shots)</option>
                <option value="trailer_2min">2-Minute Epic Movie Trailer (8 Shots)</option>
                <option value="short_5min">5-Minute Narrative Short Film (14 Shots)</option>
                <option value="episode_15min">15-Minute Episodic Act (20 Shots)</option>
                <option value="feature_30min">30-Minute Feature Film Sequence (26+ Shots)</option>
              </select>
              <p className="text-[11px] text-zinc-500">
                All durations export in 4K at 0 credit cost.
              </p>
            </div>

            {/* Visual Animation / Film Style */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5 text-amber-400" /> Visual & Animation Style
              </label>
              <select
                value={visualStyle}
                onChange={(e) => setVisualStyle(e.target.value as VisualStyle)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="cinematic_photoreal">Photorealistic 8K IMAX Masterpiece</option>
                <option value="cyberpunk_noir">Cyberpunk Neo-Noir (Blade Runner 2049)</option>
                <option value="vintage_35mm">Vintage Panavision 1970s Film (Kodak 35mm)</option>
                <option value="dark_fantasy">Dark Fantasy Epic (Lord of the Rings)</option>
                <option value="anime_ghibli">Studio Ghibli Hand-Drawn Anime</option>
                <option value="pixar_3d">Pixar / Unreal Engine 5 3D Render</option>
                <option value="noir_monochrome">Film Noir High Contrast Black & White</option>
                <option value="imax_scifi">Interstellar Anamorphic 70mm Sci-Fi</option>
              </select>
            </div>
          </div>

          {/* Aspect Ratio & Soundtrack */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-amber-400" /> Aspect Ratio
              </label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value as AspectRatio)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="2.39:1">2.39:1 Anamorphic Cinema Scope (Letterboxed)</option>
                <option value="16:9">16:9 Modern Widescreen</option>
                <option value="9:16">9:16 Mobile Vertical (TikTok / Reels 4K)</option>
                <option value="4:3">4:3 IMAX Classic Academy Ratio</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-200 flex items-center gap-1.5">
                <Music className="w-3.5 h-3.5 text-amber-400" /> Cinematic Audio Score Preset
              </label>
              <select
                value={soundtrack}
                onChange={(e) => setSoundtrack(e.target.value as SoundtrackPreset)}
                className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700/80 text-white text-xs focus:outline-none focus:border-amber-400"
              >
                <option value="hans_zimmer_epic">Hans Zimmer Brass & Sub-Bass Braams</option>
                <option value="cyberpunk_synth">Cyberpunk Analog Synthwave & Basslines</option>
                <option value="cosmic_ambient">Cosmic Harmonic Drones & Stellar Shimmer</option>
                <option value="dark_noir">Dark Film Noir Melancholic Brass & Strings</option>
                <option value="horror_suspense">Tension Heartbeat & Dissonant Strings</option>
                <option value="action_pulse">High Velocity Action Percussion Pulse</option>
              </select>
            </div>
          </div>

          {/* Character Consistency Studio Section */}
          <div className="bg-zinc-950/70 border border-zinc-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5" /> Character Consistency Bible
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Keeps facial & attire consistency across all scenes</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400">Protagonist Name</label>
                <input
                  type="text"
                  value={characterName}
                  onChange={(e) => setCharacterName(e.target.value)}
                  placeholder="e.g. Elena Vance"
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400">Signature Visual Traits / Wardrobe</label>
                <input
                  type="text"
                  value={characterTraits}
                  onChange={(e) => setCharacterTraits(e.target.value)}
                  placeholder="e.g. Silver cropped hair, amber eyes, distressed leather duster"
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            {/* Optional Image Reference Uploader */}
            <div className="pt-1">
              <label className="text-[11px] text-zinc-400 block mb-1">
                Optional Reference Image (Face / Keyframe Moodboard)
              </label>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs cursor-pointer transition">
                  <Upload className="w-3.5 h-3.5 text-amber-400" />
                  <span>Choose Image File...</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
                {referenceImage && (
                  <div className="flex items-center gap-2">
                    <img
                      src={referenceImage}
                      alt="Ref"
                      className="w-8 h-8 rounded-lg object-cover border border-amber-500/40"
                    />
                    <span className="text-[11px] text-emerald-400">Reference Loaded</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Loading Indicator */}
          {isLoading && (
            <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 flex items-center gap-3">
              <div className="w-5 h-5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin shrink-0"></div>
              <div className="text-xs">
                <div className="font-semibold text-amber-300">Generating Film Sequences...</div>
                <div className="text-zinc-400">{loadingStep}</div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-300 hover:from-amber-400 hover:to-amber-200 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-95 disabled:opacity-50 transition"
            >
              <Sparkles className="w-4 h-4 fill-current" />
              {isLoading ? 'Creating Production...' : 'Generate 4K Film (0 Credits)'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
