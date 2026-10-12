export type DurationMode = 'teaser_30s' | 'trailer_2min' | 'short_5min' | 'episode_15min' | 'feature_30min';

export type AspectRatio = '2.39:1' | '16:9' | '9:16' | '4:3';

export type CameraAngle =
  | 'Drone Aerial'
  | 'Low Angle Hero'
  | 'Tracking Dolly In'
  | 'Dutch Angle'
  | 'Extreme Close-Up'
  | 'Crane Shot'
  | 'Steadicam Follow'
  | '360 Orbit'
  | 'Macro Focus Pull'
  | 'Over-the-Shoulder'
  | 'POV First-Person';

export type CameraLens =
  | '16mm Ultra-Wide'
  | '24mm Anamorphic f/2.0'
  | '35mm Panavision Prime'
  | '50mm f/1.2 Master Prime'
  | '85mm Portrait Cine-Lens'
  | '200mm Telephoto Compression';

export type VisualStyle =
  | 'cinematic_photoreal'
  | 'cyberpunk_noir'
  | 'vintage_35mm'
  | 'dark_fantasy'
  | 'anime_ghibli'
  | 'pixar_3d'
  | 'noir_monochrome'
  | 'imax_scifi';

export type ColorLut =
  | 'teal_orange'
  | 'bleach_bypass'
  | 'noir_monochrome'
  | 'cyber_neon'
  | 'kodak_vintage'
  | 'golden_hour'
  | 'sci_fi_matrix'
  | 'natural';

export type SoundtrackPreset =
  | 'hans_zimmer_epic'
  | 'cyberpunk_synth'
  | 'cosmic_ambient'
  | 'dark_noir'
  | 'horror_suspense'
  | 'action_pulse';

export interface CameraMovement {
  type: 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' | 'tilt_up' | 'tilt_down' | 'dolly_in' | 'dolly_out' | 'orbital' | 'static';
  speed: number;
  zoomDelta: number;
  panDeltaX: number;
  panDeltaY: number;
}

export interface Character {
  id: string;
  name: string;
  tagline: string;
  visualDescription: string;
  seed: number;
  referenceImage?: string;
}

export type VoicePersona =
  | 'trailer_baritone'
  | 'epic_documentary'
  | 'cyberpunk_synth'
  | 'dramatic_whisper'
  | 'heroic_commander'
  | 'sci_fi_ai';

export interface Shot {
  id: string;
  shotNumber: number;
  title: string;
  cameraAngle: CameraAngle;
  cameraLens: CameraLens;
  cameraMovement: CameraMovement;
  lighting: string;
  sceneDescription: string;
  visualPrompt: string;
  imageUrl?: string;
  customUploadedImage?: string;
  characterInShot?: string;
  dialogue?: string;
  speaker?: string;
  soundEffect?: string;
  customVoiceAudioUrl?: string;
  duration: number; // in seconds (2 to 30)
  transition: 'Cut' | 'Dissolve' | 'Fade to Black' | 'Whip Pan';
  isGeneratingImage?: boolean;
}

export interface FilmProject {
  id: string;
  title: string;
  logline: string;
  synopsis: string;
  genre: string;
  style: VisualStyle;
  durationMode: DurationMode;
  aspectRatio: AspectRatio;
  colorLut: ColorLut;
  filmGrain: number; // 0 to 1
  letterbox: boolean;
  soundtrackTheme: string;
  soundtrackPreset: SoundtrackPreset;
  characters: Character[];
  shots: Shot[];
  audioEnabled: boolean;
  voiceoverEnabled: boolean;
  voicePersona: VoicePersona;
  narratorVoiceRate: number;
  narratorVoicePitch: number;
  musicVolume: number;
  voiceVolume: number;
  sfxVolume: number;
}
