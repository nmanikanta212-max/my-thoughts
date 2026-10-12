// Procedural Web Audio API Cinematic Synthesizer & Voiceover Engine
// Zero external files, zero paid dependencies, runs 100% offline and in-browser

import { SoundtrackPreset, VoicePersona } from '../types/cinema';

class CinematicAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  public musicGain: GainNode | null = null;
  public sfxGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private activeNodes: (AudioNode | number)[] = [];
  private pulseTimer: number | null = null;
  private currentPreset: SoundtrackPreset = 'hans_zimmer_epic';

  public destinationStream: MediaStreamAudioDestinationNode | null = null;

  public init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();

      // Master bus
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);

      // Sub-buses
      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      // Analyser for real-time visualizer
      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      try {
        this.destinationStream = this.ctx.createMediaStreamDestination();
        this.masterGain.connect(this.destinationStream);
      } catch (e) {
        console.warn('MediaStreamDestination not supported', e);
      }
    }

    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getAudioContext(): AudioContext | null {
    this.init();
    return this.ctx;
  }

  public setVolume(volume: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public setMusicVolume(volume: number) {
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public setSfxVolume(volume: number) {
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setValueAtTime(Math.max(0, Math.min(1, volume)), this.ctx.currentTime);
    }
  }

  public getWaveformData(): Uint8Array {
    if (!this.analyser) {
      return new Uint8Array(32);
    }
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    return data;
  }

  public playPreset(preset: SoundtrackPreset) {
    this.init();
    if (!this.ctx || !this.musicGain) return;
    this.stop();
    this.isPlaying = true;
    this.currentPreset = preset;

    switch (preset) {
      case 'hans_zimmer_epic':
        this.startHansZimmerEpic();
        break;
      case 'cyberpunk_synth':
        this.startCyberpunkSynth();
        break;
      case 'cosmic_ambient':
        this.startCosmicAmbient();
        break;
      case 'dark_noir':
        this.startDarkNoir();
        break;
      case 'horror_suspense':
        this.startHorrorSuspense();
        break;
      case 'action_pulse':
        this.startActionPulse();
        break;
      default:
        this.startHansZimmerEpic();
    }
  }

  public stop() {
    this.isPlaying = false;
    if (this.pulseTimer) {
      window.clearInterval(this.pulseTimer);
      this.pulseTimer = null;
    }

    this.activeNodes.forEach((node) => {
      try {
        if (typeof node === 'number') {
          window.clearTimeout(node);
        } else if ('stop' in node && typeof (node as any).stop === 'function') {
          (node as any).stop();
          (node as any).disconnect();
        } else if ('disconnect' in node) {
          node.disconnect();
        }
      } catch (e) {
        // node already stopped
      }
    });
    this.activeNodes = [];
  }

  // Trigger high-impact transition sound FX (Whoosh / Braam / Riser / Laser)
  public triggerImpact(type: 'braam' | 'whoosh' | 'sub_drop' | 'riser' | 'laser' | 'thunder' = 'braam') {
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;

    if (type === 'braam') {
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'triangle';
      osc1.frequency.setValueAtTime(55, t);
      osc2.frequency.setValueAtTime(55.5, t);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(150, t);
      filter.frequency.exponentialRampToValueAtTime(850, t + 0.3);
      filter.frequency.exponentialRampToValueAtTime(200, t + 2.5);

      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.85, t + 0.15);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 3.0);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      osc1.start(t);
      osc2.start(t);
      osc1.stop(t + 3.1);
      osc2.stop(t + 3.1);
    } else if (type === 'whoosh') {
      const bufferSize = this.ctx.sampleRate * 1.0;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.value = 3;
      filter.frequency.setValueAtTime(200, t);
      filter.frequency.exponentialRampToValueAtTime(3200, t + 0.4);
      filter.frequency.exponentialRampToValueAtTime(300, t + 0.9);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.65, t + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);

      whiteNoise.start(t);
      whiteNoise.stop(t + 1.0);
    } else if (type === 'sub_drop') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(130, t);
      osc.frequency.exponentialRampToValueAtTime(28, t + 1.5);

      gain.gain.setValueAtTime(0.8, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 1.8);
    } else if (type === 'laser') {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(900, t);
      osc.frequency.exponentialRampToValueAtTime(60, t + 0.35);

      gain.gain.setValueAtTime(0.5, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.4);
    } else if (type === 'thunder') {
      const bufferSize = this.ctx.sampleRate * 2.5;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const noise = this.ctx.createBufferSource();
      noise.buffer = noiseBuffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, t);
      filter.frequency.exponentialRampToValueAtTime(80, t + 2.0);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.01, t);
      gain.gain.linearRampToValueAtTime(0.9, t + 0.2);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.5);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.sfxGain);
      noise.start(t);
      noise.stop(t + 2.5);
    }
  }

  // Preset 1: Hans Zimmer Epic
  private startHansZimmerEpic() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    const bassOsc = this.ctx.createOscillator();
    const bassGain = this.ctx.createGain();
    bassOsc.type = 'sawtooth';
    bassOsc.frequency.setValueAtTime(43.65, t);

    const bassFilter = this.ctx.createBiquadFilter();
    bassFilter.type = 'lowpass';
    bassFilter.frequency.setValueAtTime(120, t);

    bassGain.gain.setValueAtTime(0.3, t);
    bassOsc.connect(bassFilter);
    bassFilter.connect(bassGain);
    bassGain.connect(this.musicGain);
    bassOsc.start(t);

    this.activeNodes.push(bassOsc, bassGain, bassFilter);

    const chordFreqs = [87.31, 130.81, 155.56, 174.61];
    chordFreqs.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq + (idx % 2 === 0 ? 0.3 : -0.3), t);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(350, t);

      gain.gain.setValueAtTime(0.08, t);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);
      osc.start(t);

      this.activeNodes.push(osc, gain, filter);
    });

    let braamCount = 0;
    this.pulseTimer = window.setInterval(() => {
      if (!this.isPlaying) return;
      braamCount++;
      if (braamCount % 2 === 0) {
        this.triggerImpact('braam');
      } else {
        this.triggerImpact('sub_drop');
      }
    }, 7000);
  }

  // Preset 2: Cyberpunk Synthwave
  private startCyberpunkSynth() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    const bassNotes = [55, 55, 65.41, 73.42];
    let step = 0;

    const baseOsc = this.ctx.createOscillator();
    baseOsc.type = 'sawtooth';
    baseOsc.frequency.setValueAtTime(55, t);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, t);
    filter.Q.value = 5;

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.25, t);

    baseOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    baseOsc.start(t);

    this.activeNodes.push(baseOsc, filter, gain);

    this.pulseTimer = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      step = (step + 1) % bassNotes.length;
      baseOsc.frequency.setValueAtTime(bassNotes[step], this.ctx.currentTime);

      const neonOsc = this.ctx.createOscillator();
      const neonGain = this.ctx.createGain();
      neonOsc.type = 'sine';
      neonOsc.frequency.setValueAtTime(440 * (step % 2 === 0 ? 1.5 : 2), this.ctx.currentTime);

      neonGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      neonGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);

      neonOsc.connect(neonGain);
      neonGain.connect(this.musicGain!);
      neonOsc.start(this.ctx.currentTime);
      neonOsc.stop(this.ctx.currentTime + 0.35);
    }, 400);
  }

  // Preset 3: Cosmic Ambient
  private startCosmicAmbient() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    const freqs = [65.41, 98.0, 130.81, 196.0, 261.63];
    freqs.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const filter = this.ctx!.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, t);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);

      gain.gain.setValueAtTime(0.06, t);
      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain!);
      osc.start(t);

      this.activeNodes.push(osc, gain, filter);
    });

    this.pulseTimer = window.setInterval(() => {
      if (!this.isPlaying) return;
      this.triggerImpact('whoosh');
    }, 8500);
  }

  // Preset 4: Dark Noir
  private startDarkNoir() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    const bass = this.ctx.createOscillator();
    bass.type = 'triangle';
    bass.frequency.setValueAtTime(49.0, t);
    const bassGain = this.ctx.createGain();
    bassGain.gain.setValueAtTime(0.25, t);

    bass.connect(bassGain);
    bassGain.connect(this.musicGain);
    bass.start(t);

    this.activeNodes.push(bass, bassGain);

    const sax = this.ctx.createOscillator();
    sax.type = 'sawtooth';
    sax.frequency.setValueAtTime(196.0, t);
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(650, t);
    filter.Q.value = 4;
    const saxGain = this.ctx.createGain();
    saxGain.gain.setValueAtTime(0.05, t);

    sax.connect(filter);
    filter.connect(saxGain);
    saxGain.connect(this.musicGain);
    sax.start(t);

    this.activeNodes.push(sax, filter, saxGain);
  }

  // Preset 5: Horror Suspense
  private startHorrorSuspense() {
    if (!this.ctx || !this.musicGain) return;
    const t = this.ctx.currentTime;

    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(82.41, t);
    osc2.frequency.setValueAtTime(87.31, t);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(180, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.18, t);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);

    osc1.start(t);
    osc2.start(t);

    this.activeNodes.push(osc1, osc2, filter, gain);

    this.pulseTimer = window.setInterval(() => {
      if (!this.isPlaying) return;
      this.triggerImpact('sub_drop');
    }, 3200);
  }

  // Preset 6: Action Pulse
  private startActionPulse() {
    if (!this.ctx || !this.musicGain) return;

    this.pulseTimer = window.setInterval(() => {
      if (!this.isPlaying || !this.ctx) return;
      const kickOsc = this.ctx.createOscillator();
      const kickGain = this.ctx.createGain();
      kickOsc.type = 'sine';
      kickOsc.frequency.setValueAtTime(140, this.ctx.currentTime);
      kickOsc.frequency.exponentialRampToValueAtTime(35, this.ctx.currentTime + 0.15);

      kickGain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      kickGain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);

      kickOsc.connect(kickGain);
      kickGain.connect(this.musicGain!);
      kickOsc.start(this.ctx.currentTime);
      kickOsc.stop(this.ctx.currentTime + 0.22);
    }, 600);
  }

  // Render standalone offline WAV audio file
  public async exportSoundtrackWav(preset: SoundtrackPreset, durationSeconds = 30): Promise<Blob> {
    const sampleRate = 44100;
    const totalSamples = Math.round(sampleRate * Math.min(180, Math.max(5, durationSeconds)));
    const offlineCtx = new OfflineAudioContext(2, totalSamples, sampleRate);

    // Build preset nodes in offline context
    const masterGain = offlineCtx.createGain();
    masterGain.gain.setValueAtTime(0.7, 0);
    masterGain.connect(offlineCtx.destination);

    // Synthesize drone base
    const osc = offlineCtx.createOscillator();
    osc.type = preset === 'cyberpunk_synth' ? 'sawtooth' : 'triangle';
    osc.frequency.setValueAtTime(55, 0);

    const filter = offlineCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, 0);

    osc.connect(filter);
    filter.connect(masterGain);
    osc.start(0);
    osc.stop(durationSeconds);

    const renderedBuffer = await offlineCtx.startRendering();
    return audioBufferToWav(renderedBuffer);
  }
}

// Convert AudioBuffer to Standard 16-Bit Stereo WAV Blob
function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numOfChan = buffer.numberOfChannels;
  const length = buffer.length * numOfChan * 2 + 44;
  const out = new DataView(new ArrayBuffer(length));
  const channels: Float32Array[] = [];
  let sample = 0;
  let offset = 0;
  let pos = 0;

  // RIFF chunk
  setUint32(0x46464952); // "RIFF"
  setUint32(length - 8);
  setUint32(0x45564157); // "WAVE"

  // FMT chunk
  setUint32(0x20746d66); // "fmt "
  setUint32(16); // subchunk1size
  setUint16(1); // PCM
  setUint16(numOfChan);
  setUint32(buffer.sampleRate);
  setUint32(buffer.sampleRate * 2 * numOfChan); // byte rate
  setUint16(numOfChan * 2); // block align
  setUint16(16); // bits per sample

  // Data chunk
  setUint32(0x61746164); // "data"
  setUint32(length - pos - 4);

  for (let i = 0; i < buffer.numberOfChannels; i++) {
    channels.push(buffer.getChannelData(i));
  }

  while (pos < buffer.length) {
    for (let i = 0; i < numOfChan; i++) {
      sample = Math.max(-1, Math.min(1, channels[i][pos]));
      sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0;
      out.setInt16(44 + offset, sample, true);
      offset += 2;
    }
    pos++;
  }

  function setUint16(data: number) {
    out.setUint16(pos, data, true);
    pos += 2;
  }
  function setUint32(data: number) {
    out.setUint32(pos, data, true);
    pos += 4;
  }

  return new Blob([out.buffer], { type: 'audio/wav' });
}

export const audioSynthesizer = new CinematicAudioEngine();

// Web Speech API Voiceover Synthesizer with Custom Cinematic Personas
export function speakDialogue(
  text: string,
  persona: VoicePersona = 'trailer_baritone',
  customRate?: number,
  customPitch?: number
): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) {
      resolve();
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text.trim();
    if (!cleanText) {
      resolve();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Configure persona parameters
    switch (persona) {
      case 'trailer_baritone':
        utterance.rate = customRate || 0.85;
        utterance.pitch = customPitch || 0.78;
        break;
      case 'epic_documentary':
        utterance.rate = customRate || 0.92;
        utterance.pitch = customPitch || 0.95;
        break;
      case 'cyberpunk_synth':
        utterance.rate = customRate || 1.05;
        utterance.pitch = customPitch || 1.1;
        break;
      case 'dramatic_whisper':
        utterance.rate = customRate || 0.78;
        utterance.pitch = customPitch || 0.8;
        break;
      case 'heroic_commander':
        utterance.rate = customRate || 0.95;
        utterance.pitch = customPitch || 0.9;
        break;
      case 'sci_fi_ai':
        utterance.rate = customRate || 1.1;
        utterance.pitch = customPitch || 1.15;
        break;
      default:
        utterance.rate = customRate || 0.9;
        utterance.pitch = customPitch || 0.85;
    }

    const voices = window.speechSynthesis.getVoices();
    const deepVoice =
      voices.find((v) => v.name.includes('Daniel') || v.name.includes('Guy') || v.name.includes('George') || v.name.includes('Natural')) ||
      voices.find((v) => v.lang.startsWith('en')) ||
      voices[0];

    if (deepVoice) {
      utterance.voice = deepVoice;
    }

    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();

    window.speechSynthesis.speak(utterance);
  });
}

export function stopDialogue() {
  if (window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
}
