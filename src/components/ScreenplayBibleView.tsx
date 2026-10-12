import React, { useState } from 'react';
import {
  Film,
  User,
  Plus,
  Trash2,
  Sparkles,
  Upload,
  CheckCircle,
  FileText,
  Sliders,
  ShieldCheck,
} from 'lucide-react';
import { FilmProject, Character } from '../types/cinema';

interface ScreenplayBibleViewProps {
  project: FilmProject;
  onUpdateProject: (updated: FilmProject) => void;
}

export const ScreenplayBibleView: React.FC<ScreenplayBibleViewProps> = ({
  project,
  onUpdateProject,
}) => {
  const [activeTab, setActiveTab] = useState<'screenplay' | 'bible'>('screenplay');
  const [newCharName, setNewCharName] = useState('');
  const [newCharTagline, setNewCharTagline] = useState('');
  const [newCharDesc, setNewCharDesc] = useState('');

  // Add character to bible
  const handleAddCharacter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCharName.trim()) return;

    const newChar: Character = {
      id: `char-${Date.now()}`,
      name: newCharName.trim(),
      tagline: newCharTagline.trim() || 'Key Figure',
      visualDescription: newCharDesc.trim() || 'Consistent facial features, distinct attire',
      seed: Math.floor(Math.random() * 899999) + 100000,
    };

    onUpdateProject({
      ...project,
      characters: [...project.characters, newChar],
    });

    setNewCharName('');
    setNewCharTagline('');
    setNewCharDesc('');
  };

  // Delete character
  const handleDeleteCharacter = (id: string) => {
    onUpdateProject({
      ...project,
      characters: project.characters.filter((c) => c.id !== id),
    });
  };

  // Upload reference image for character
  const handleCharacterImageUpload = (charId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const updatedChars = project.characters.map((c) => {
        if (c.id === charId) {
          return { ...c, referenceImage: dataUrl };
        }
        return c;
      });
      onUpdateProject({ ...project, characters: updatedChars });
    };
    reader.readAsDataURL(file);
  };

  // Propagate character consistency across all shots
  const handlePropagateConsistency = (character: Character) => {
    const updatedShots = project.shots.map((shot) => {
      return {
        ...shot,
        characterInShot: character.name,
        visualPrompt: `${character.visualDescription}, ${shot.visualPrompt}`,
      };
    });

    onUpdateProject({
      ...project,
      shots: updatedShots,
    });

    alert(`Applied visual consistency profile for "${character.name}" across all ${project.shots.length} sequences!`);
  };

  return (
    <div className="space-y-6">
      {/* Tab Switcher Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-zinc-900/80 border border-zinc-800 rounded-xl p-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-400" /> Screenplay & Character Consistency Bible
          </h3>
          <p className="text-xs text-zinc-400 mt-0.5">
            Hollywood script margins, dramatic beats, and locked visual identity seeds for persistent character faces.
          </p>
        </div>

        <div className="flex items-center bg-zinc-950 p-1 rounded-lg border border-zinc-800">
          <button
            onClick={() => setActiveTab('screenplay')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'screenplay'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Formatted Screenplay
          </button>
          <button
            onClick={() => setActiveTab('bible')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'bible'
                ? 'bg-amber-500 text-zinc-950 font-bold'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Character Bible ({project.characters.length})
          </button>
        </div>
      </div>

      {activeTab === 'screenplay' ? (
        /* Hollywood Formatted Screenplay */
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-10 font-mono text-xs text-zinc-300 shadow-2xl space-y-8 max-w-4xl mx-auto">
          {/* Script Title Page Header */}
          <div className="text-center pb-8 border-b border-zinc-800 space-y-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-widest text-white uppercase">
              {project.title}
            </h1>
            <p className="text-zinc-500 text-xs">
              ORIGINAL SCREENPLAY & CINEMATIC DIRECTORS BREAKDOWN
            </p>
            <p className="text-amber-400/90 text-xs">
              FORMAT: {project.durationMode.replace('_', ' ').toUpperCase()} • 4K SCOPE
            </p>
          </div>

          {/* Logline & Synopsis */}
          <div className="space-y-2 bg-zinc-900/60 p-4 rounded-xl border border-zinc-800">
            <div className="text-amber-400 font-bold uppercase text-[11px]">LOGLINE:</div>
            <p className="italic text-zinc-200">{project.logline}</p>
            <div className="text-amber-400 font-bold uppercase text-[11px] pt-2">SYNOPSIS:</div>
            <p className="text-zinc-300 leading-relaxed">{project.synopsis}</p>
          </div>

          {/* Scene Breakdown */}
          <div className="space-y-8">
            {project.shots.map((shot, idx) => (
              <div key={shot.id} className="space-y-3 pl-4 border-l-2 border-amber-500/40">
                {/* Scene Slugline */}
                <div className="font-bold text-white uppercase tracking-wider text-xs flex items-center justify-between">
                  <span>
                    SCENE {idx + 1}: {shot.cameraAngle.toUpperCase()} - {shot.title.toUpperCase()}
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono font-normal">
                    {shot.cameraLens} • {shot.duration} SEC
                  </span>
                </div>

                {/* Action Paragraph */}
                <p className="text-zinc-300 leading-relaxed font-sans text-xs">
                  {shot.sceneDescription}
                </p>

                {/* Camera & Lighting Directions */}
                <div className="text-[11px] text-zinc-500 font-mono bg-zinc-900/40 p-2 rounded border border-zinc-800/60">
                  <span className="text-amber-300 font-semibold">[CAMERA]:</span> {shot.cameraMovement.type.toUpperCase()} at speed {shot.cameraMovement.speed}x. <br />
                  <span className="text-cyan-300 font-semibold">[LIGHTING]:</span> {shot.lighting}
                </div>

                {/* Dialogue */}
                {shot.dialogue && (
                  <div className="max-w-md mx-auto text-center space-y-1 pt-1">
                    <div className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                      {shot.speaker || 'NARRATOR'}
                    </div>
                    <div className="italic text-white text-xs leading-relaxed">
                      "{shot.dialogue}"
                    </div>
                  </div>
                )}

                {/* Sound FX Cue */}
                {shot.soundEffect && (
                  <div className="text-[11px] text-cyan-400 italic">
                    (SFX: {shot.soundEffect.toUpperCase()})
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Fade Out */}
          <div className="text-right text-white font-bold pt-6 border-t border-zinc-800">
            FADE OUT.
          </div>
        </div>
      ) : (
        /* Character Consistency Bible */
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Character Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {project.characters.map((char) => (
              <div
                key={char.id}
                className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 space-y-3 hover:border-amber-500/40 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-700 overflow-hidden flex items-center justify-center shrink-0">
                      {char.referenceImage ? (
                        <img
                          src={char.referenceImage}
                          alt={char.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{char.name}</h4>
                      <p className="text-[11px] text-amber-400/90 font-medium">{char.tagline}</p>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        LOCKED SEED: #{char.seed}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteCharacter(char.id)}
                    className="p-1 rounded text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition"
                    title="Remove Character"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded-lg border border-zinc-800/80 leading-relaxed">
                  <span className="text-[10px] text-zinc-500 uppercase font-mono block mb-1">
                    Consistent Traits & Attire:
                  </span>
                  {char.visualDescription}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label className="flex-1 py-1.5 px-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer border border-zinc-700 transition">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Face Ref</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleCharacterImageUpload(char.id, e)}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={() => handlePropagateConsistency(char)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-medium flex items-center justify-center gap-1.5 border border-amber-500/40 transition"
                    title="Propagate character seed and facial traits across all film shots"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Apply Across All Shots
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Character Form */}
          <form
            onSubmit={handleAddCharacter}
            className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4"
          >
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Plus className="w-3.5 h-3.5 text-amber-400" /> Add New Character to Bible
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-zinc-400">Character Name</label>
                <input
                  type="text"
                  value={newCharName}
                  onChange={(e) => setNewCharName(e.target.value)}
                  placeholder="e.g. Rachel Thorne"
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-zinc-400">Archetype / Role</label>
                <input
                  type="text"
                  value={newCharTagline}
                  onChange={(e) => setNewCharTagline(e.target.value)}
                  placeholder="e.g. Rogue Netrunner / Cyberneticist"
                  className="w-full mt-1 px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] text-zinc-400">
                Visual Consistency Prompt (Facial Structure, Eyes, Hair, Signature Wardrobe)
              </label>
              <textarea
                value={newCharDesc}
                onChange={(e) => setNewCharDesc(e.target.value)}
                placeholder="e.g. Athletic female operative, sharp jawline, asymmetrical silver hair, glowing amber ocular implant, high-collar tactical coat..."
                rows={2}
                className="w-full mt-1 px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-700 text-white text-xs focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold transition flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" /> Save Character to Bible
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
