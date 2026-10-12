// 4K Cinematic Canvas Rendering Engine & Exporter
import { FilmProject, Shot, ColorLut, CameraMovement } from '../types/cinema';
import { audioSynthesizer } from './audioSynthesizer';

export interface RenderDimensions {
  width: number;
  height: number;
  label: string;
}

export const RESOLUTION_PRESETS: Record<string, RenderDimensions> = {
  '4k': { width: 3840, height: 2160, label: '4K Ultra HD (3840 × 2160)' },
  '2k': { width: 2560, height: 1440, label: '2K Quad HD (2560 × 1440)' },
  '1080p': { width: 1920, height: 1080, label: '1080p Full HD (1920 × 1080)' },
  'vertical_4k': { width: 2160, height: 3840, label: '9:16 Vertical 4K (2160 × 3840)' },
  'vertical_1080p': { width: 1080, height: 1920, label: '9:16 Vertical HD (1080 × 1920)' },
};

// Smooth cubic ease in out
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

// Generate image cache
const imageCache = new Map<string, HTMLImageElement>();

export function preloadImage(url: string): Promise<HTMLImageElement> {
  if (imageCache.has(url)) {
    return Promise.resolve(imageCache.get(url)!);
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(url, img);
      resolve(img);
    };
    img.onerror = () => {
      // create fallback canvas
      const fallbackCanvas = document.createElement('canvas');
      fallbackCanvas.width = 1920;
      fallbackCanvas.height = 1080;
      const ctx = fallbackCanvas.getContext('2d');
      if (ctx) {
        const grad = ctx.createLinearGradient(0, 0, 1920, 1080);
        grad.addColorStop(0, '#0a0f1d');
        grad.addColorStop(1, '#1e1022');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 1920, 1080);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 36px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CINEMATIC FRAME INITIALIZING', 960, 540);
      }
      const fallbackImg = new Image();
      fallbackImg.src = fallbackCanvas.toDataURL();
      resolve(fallbackImg);
    };
    img.src = url;
  });
}

// Draw a single cinematic frame onto canvas
export function drawCinematicFrame({
  ctx,
  width,
  height,
  shot,
  nextShot,
  progress, // 0 to 1 for current shot
  project,
  image,
  nextImage,
  transitionProgress = 0, // 0 if not transitioning, >0 if dissolving into next shot
}: {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  shot: Shot;
  nextShot?: Shot;
  progress: number;
  project: FilmProject;
  image?: HTMLImageElement | null;
  nextImage?: HTMLImageElement | null;
  transitionProgress?: number;
}) {
  ctx.save();
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, width, height);

  const t = easeInOutCubic(Math.max(0, Math.min(1, progress)));

  // Calculate Camera Transform
  const mov = shot.cameraMovement;
  let scale = 1.0;
  let offsetX = 0;
  let offsetY = 0;
  let rotate = 0;

  switch (mov.type) {
    case 'zoom_in':
    case 'dolly_in':
      scale = 1.0 + t * (mov.zoomDelta || 0.18);
      offsetX = t * (mov.panDeltaX || 0);
      offsetY = t * (mov.panDeltaY || 0);
      break;
    case 'zoom_out':
    case 'dolly_out':
      scale = 1.0 + (mov.zoomDelta || 0.18) - t * (mov.zoomDelta || 0.18);
      offsetX = (1 - t) * (mov.panDeltaX || 0);
      offsetY = (1 - t) * (mov.panDeltaY || 0);
      break;
    case 'pan_left':
      scale = 1.08;
      offsetX = (1 - t * 2) * (mov.panDeltaX || 25);
      break;
    case 'pan_right':
      scale = 1.08;
      offsetX = (t * 2 - 1) * (mov.panDeltaX || 25);
      break;
    case 'tilt_up':
      scale = 1.1;
      offsetY = (1 - t * 2) * (mov.panDeltaY || 20);
      break;
    case 'tilt_down':
      scale = 1.1;
      offsetY = (t * 2 - 1) * (mov.panDeltaY || 20);
      break;
    case 'orbital':
      scale = 1.12 + Math.sin(t * Math.PI) * 0.05;
      offsetX = Math.sin(t * Math.PI * 2) * (mov.panDeltaX || 15);
      offsetY = Math.cos(t * Math.PI * 2) * (mov.panDeltaY || 10);
      rotate = (t - 0.5) * 0.03; // subtle rotation
      break;
    default:
      scale = 1.05 + t * 0.03;
  }

  // Draw Primary Image with Camera Movement
  ctx.save();
  ctx.translate(width / 2 + offsetX * (width / 500), height / 2 + offsetY * (height / 500));
  if (rotate !== 0) ctx.rotate(rotate);
  ctx.scale(scale, scale);

  if (image && image.complete && image.naturalWidth > 0) {
    // Aspect fit/cover
    const imgRatio = image.naturalWidth / image.naturalHeight;
    const canvasRatio = width / height;
    let drawW = width;
    let drawH = height;

    if (canvasRatio > imgRatio) {
      drawW = width;
      drawH = width / imgRatio;
    } else {
      drawH = height;
      drawW = height * imgRatio;
    }

    ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
  } else {
    // Stylized procedural backdrop if image is still loading
    const grad = ctx.createLinearGradient(-width / 2, -height / 2, width / 2, height / 2);
    grad.addColorStop(0, '#0f172a');
    grad.addColorStop(0.5, '#1e1b4b');
    grad.addColorStop(1, '#020617');
    ctx.fillStyle = grad;
    ctx.fillRect(-width / 2, -height / 2, width, height);

    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = `600 ${Math.round(width * 0.02)}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`RENDERING CINEMATIC SHOT: ${shot.title}`, 0, 0);
  }
  ctx.restore();

  // If Dissolve transition into next shot
  if (transitionProgress > 0 && nextImage && nextShot) {
    ctx.save();
    ctx.globalAlpha = transitionProgress;
    ctx.translate(width / 2, height / 2);
    const nextScale = 1.0 + transitionProgress * 0.08;
    ctx.scale(nextScale, nextScale);

    if (nextImage.complete && nextImage.naturalWidth > 0) {
      const imgRatio = nextImage.naturalWidth / nextImage.naturalHeight;
      const canvasRatio = width / height;
      let drawW = width;
      let drawH = height;
      if (canvasRatio > imgRatio) {
        drawW = width;
        drawH = width / imgRatio;
      } else {
        drawH = height;
        drawW = height * imgRatio;
      }
      ctx.drawImage(nextImage, -drawW / 2, -drawH / 2, drawW, drawH);
    }
    ctx.restore();
  }

  // Fade to black transition handling
  if (shot.transition === 'Fade to Black' && progress > 0.8) {
    const fadeAlpha = (progress - 0.8) / 0.2;
    ctx.fillStyle = `rgba(0, 0, 0, ${fadeAlpha})`;
    ctx.fillRect(0, 0, width, height);
  }

  // Apply Color LUT & Grading
  applyColorGrade(ctx, width, height, project.colorLut);

  // Apply Dynamic 35mm Film Grain
  if (project.filmGrain > 0) {
    applyFilmGrain(ctx, width, height, project.filmGrain);
  }

  // Apply Anamorphic Lens Flare
  applyAnamorphicFlare(ctx, width, height, t);

  // Apply Anamorphic 2.39:1 Letterbox Matte
  if (project.letterbox) {
    const barHeight = Math.round(height * 0.12);
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, barHeight);
    ctx.fillRect(0, height - barHeight, width, barHeight);

    // Subtle matte rim line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, barHeight);
    ctx.lineTo(width, barHeight);
    ctx.moveTo(0, height - barHeight);
    ctx.lineTo(width, height - barHeight);
    ctx.stroke();
  }

  // Render Subtitles / Dialogue
  if (shot.dialogue && shot.dialogue.trim()) {
    renderDialogue(ctx, width, height, shot.dialogue, shot.speaker, project.letterbox);
  }

  // Render Director HUD Overlay (optional small watermark/specs for professional look)
  renderCameraHud(ctx, width, height, shot);

  ctx.restore();
}

// Color Grading LUTs
function applyColorGrade(ctx: CanvasRenderingContext2D, width: number, height: number, lut: ColorLut) {
  ctx.save();
  switch (lut) {
    case 'teal_orange':
      // Cinematic Teal in shadows, warm Amber in highlights
      ctx.globalCompositeOperation = 'overlay';
      const toGrad = ctx.createLinearGradient(0, 0, width, height);
      toGrad.addColorStop(0, 'rgba(0, 180, 216, 0.16)');
      toGrad.addColorStop(1, 'rgba(255, 140, 0, 0.18)');
      ctx.fillStyle = toGrad;
      ctx.fillRect(0, 0, width, height);
      break;

    case 'bleach_bypass':
      // High contrast, desaturated silver look
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(200, 200, 200, 0.35)';
      ctx.fillRect(0, 0, width, height);
      break;

    case 'noir_monochrome':
      // Grayscale contrast
      ctx.globalCompositeOperation = 'color';
      ctx.fillStyle = 'rgba(128, 128, 128, 0.95)';
      ctx.fillRect(0, 0, width, height);
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
      ctx.fillRect(0, 0, width, height);
      break;

    case 'cyber_neon':
      // Electric Cyan & Magenta
      ctx.globalCompositeOperation = 'screen';
      const neonGrad = ctx.createLinearGradient(0, 0, width, height);
      neonGrad.addColorStop(0, 'rgba(255, 0, 128, 0.14)');
      neonGrad.addColorStop(1, 'rgba(0, 245, 255, 0.14)');
      ctx.fillStyle = neonGrad;
      ctx.fillRect(0, 0, width, height);
      break;

    case 'golden_hour':
      // Warm golden radiance
      ctx.globalCompositeOperation = 'soft-light';
      ctx.fillStyle = 'rgba(255, 180, 50, 0.28)';
      ctx.fillRect(0, 0, width, height);
      break;

    case 'kodak_vintage':
      // 1970s yellow-green warmth
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(245, 235, 210, 0.2)';
      ctx.fillRect(0, 0, width, height);
      break;

    case 'sci_fi_matrix':
      // Subtle green phosphor cast
      ctx.globalCompositeOperation = 'color-dodge';
      ctx.fillStyle = 'rgba(20, 180, 90, 0.12)';
      ctx.fillRect(0, 0, width, height);
      break;
    default:
      break;
  }
  ctx.restore();
}

// Procedural 35mm Film Grain
let grainCanvas: HTMLCanvasElement | null = null;
function getGrainPattern(ctx: CanvasRenderingContext2D): CanvasPattern | null {
  if (!grainCanvas) {
    grainCanvas = document.createElement('canvas');
    grainCanvas.width = 256;
    grainCanvas.height = 256;
    const gCtx = grainCanvas.getContext('2d')!;
    const imgData = gCtx.createImageData(256, 256);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = (Math.random() * 255) | 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = 25; // Subtle grain opacity
    }
    gCtx.putImageData(imgData, 0, 0);
  }
  return ctx.createPattern(grainCanvas, 'repeat');
}

function applyFilmGrain(ctx: CanvasRenderingContext2D, width: number, height: number, intensity: number) {
  ctx.save();
  ctx.globalAlpha = Math.max(0.05, Math.min(0.3, intensity * 0.25));
  ctx.globalCompositeOperation = 'screen';
  const pattern = getGrainPattern(ctx);
  if (pattern) {
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
  }
  ctx.restore();
}

// Anamorphic horizontal flare
function applyAnamorphicFlare(ctx: CanvasRenderingContext2D, width: number, height: number, t: number) {
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const flareY = height * (0.35 + Math.sin(t * 3.14) * 0.1);
  const flareGrad = ctx.createLinearGradient(0, flareY, width, flareY);
  flareGrad.addColorStop(0, 'rgba(0, 180, 255, 0)');
  flareGrad.addColorStop(0.4, 'rgba(0, 180, 255, 0.08)');
  flareGrad.addColorStop(0.5, 'rgba(120, 220, 255, 0.2)');
  flareGrad.addColorStop(0.6, 'rgba(0, 180, 255, 0.08)');
  flareGrad.addColorStop(1, 'rgba(0, 180, 255, 0)');

  ctx.fillStyle = flareGrad;
  ctx.fillRect(0, flareY - 12, width, 24);
  ctx.restore();
}

// Cinematic Subtitles
function renderDialogue(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dialogue: string,
  speaker?: string,
  hasLetterbox = true
) {
  ctx.save();
  const fontSize = Math.max(16, Math.round(width * 0.022));
  ctx.font = `500 ${fontSize}px "Cinzel", "Times New Roman", serif, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'bottom';

  const bottomMargin = hasLetterbox ? height * 0.14 : height * 0.08;
  const posY = height - bottomMargin;

  // Text with drop shadow
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;

  if (speaker && speaker !== 'None' && speaker !== 'Narrator') {
    ctx.fillStyle = '#f59e0b'; // Amber character name
    ctx.font = `bold ${Math.round(fontSize * 0.85)}px sans-serif`;
    ctx.fillText(speaker.toUpperCase(), width / 2, posY - fontSize - 6);
  }

  ctx.fillStyle = '#ffffff';
  ctx.font = `500 ${fontSize}px sans-serif`;

  // Text wrapping for long lines
  const maxWidth = width * 0.8;
  const words = dialogue.split(' ');
  let line = '';
  const lines: string[] = [];

  for (let n = 0; n < words.length; n++) {
    const testLine = line + words[n] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());

  lines.forEach((l, idx) => {
    const lineY = posY - (lines.length - 1 - idx) * (fontSize * 1.3);
    ctx.fillText(l, width / 2, lineY);
  });

  ctx.restore();
}

// Technical Director Camera HUD (shows lens, angle, fps)
function renderCameraHud(ctx: CanvasRenderingContext2D, width: number, height: number, shot: Shot) {
  ctx.save();
  const fontSize = Math.max(10, Math.round(width * 0.009));
  ctx.font = `600 ${fontSize}px monospace`;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';

  // Top Left: Camera specs
  ctx.textAlign = 'left';
  ctx.fillText(`CAM A • ${shot.cameraAngle.toUpperCase()} • ${shot.cameraLens}`, width * 0.04, height * 0.05);

  // Top Right: Motion & LUT specs
  ctx.textAlign = 'right';
  ctx.fillText(`RAW 4K 24FPS • 1/48s • ISO 800`, width * 0.96, height * 0.05);

  ctx.restore();
}

// 4K Video Exporter
export async function exportFilmTo4K({
  project,
  resolutionKey = '4k',
  fps = 24,
  onProgress,
}: {
  project: FilmProject;
  resolutionKey: string;
  fps: number;
  onProgress: (percent: number, status: string) => void;
}): Promise<Blob> {
  const res = RESOLUTION_PRESETS[resolutionKey] || RESOLUTION_PRESETS['4k'];
  const width = res.width;
  const height = res.height;

  onProgress(2, `Initializing 4K Cinema Render Engine (${width}x${height} @ ${fps}fps)...`);

  // Preload all shot images
  const loadedImages: HTMLImageElement[] = [];
  for (let i = 0; i < project.shots.length; i++) {
    const s = project.shots[i];
    const url = s.customUploadedImage || s.imageUrl || '';
    if (url) {
      onProgress(5 + Math.round((i / project.shots.length) * 20), `Loading asset for shot ${i + 1}/${project.shots.length}...`);
      const img = await preloadImage(url);
      loadedImages.push(img);
    } else {
      loadedImages.push(null as any);
    }
  }

  // Calculate total frames
  const totalDurationSeconds = project.shots.reduce((acc, s) => acc + (s.duration || 5), 0);
  const totalFrames = Math.round(totalDurationSeconds * fps);

  // Offscreen export canvas
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { alpha: false })!;

  // Set up MediaRecorder on canvas stream
  const canvasStream = canvas.captureStream(fps);

  // Connect audio if available
  const audioContext = audioSynthesizer.getAudioContext();
  if (audioContext && audioSynthesizer.destinationStream) {
    try {
      const audioTracks = audioSynthesizer.destinationStream.stream.getAudioTracks();
      if (audioTracks.length > 0) {
        canvasStream.addTrack(audioTracks[0]);
      }
    } catch (e) {
      console.warn('Could not attach audio track to video export', e);
    }
  }

  let mimeType = 'video/webm;codecs=vp9';
  if (!MediaRecorder.isTypeSupported(mimeType)) {
    mimeType = 'video/webm';
  }

  const mediaRecorder = new MediaRecorder(canvasStream, {
    mimeType,
    videoBitsPerSecond: resolutionKey === '4k' ? 35000000 : 15000000, // 35 Mbps for 4K
  });

  const recordedChunks: Blob[] = [];
  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  const recordingPromise = new Promise<Blob>((resolve) => {
    mediaRecorder.onstop = () => {
      const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
      resolve(videoBlob);
    };
  });

  mediaRecorder.start(100);

  // Render loop
  let currentFrame = 0;
  let currentShotIndex = 0;
  let currentShotTime = 0;

  for (let f = 0; f < totalFrames; f++) {
    const shot = project.shots[currentShotIndex];
    const shotDuration = shot.duration || 5;
    const shotFrames = Math.round(shotDuration * fps);
    const progressInShot = currentShotTime / shotDuration;

    const img = loadedImages[currentShotIndex];
    const nextShot = project.shots[currentShotIndex + 1];
    const nextImg = loadedImages[currentShotIndex + 1];

    // Transition progress near end of shot
    let transitionProgress = 0;
    if (shot.transition === 'Dissolve' && nextShot && progressInShot > 0.8) {
      transitionProgress = (progressInShot - 0.8) / 0.2;
    }

    drawCinematicFrame({
      ctx,
      width,
      height,
      shot,
      nextShot,
      progress: progressInShot,
      project,
      image: img,
      nextImage: nextImg,
      transitionProgress,
    });

    currentShotTime += 1 / fps;
    if (currentShotTime >= shotDuration && currentShotIndex < project.shots.length - 1) {
      currentShotIndex++;
      currentShotTime = 0;
    }

    currentFrame++;

    if (f % Math.max(1, Math.round(fps / 2)) === 0) {
      const percent = 25 + Math.round((f / totalFrames) * 70);
      onProgress(percent, `Rendering 4K frame ${f + 1} of ${totalFrames} (${Math.round((f / totalFrames) * 100)}%)...`);
      // Yield thread for browser responsiveness
      await new Promise((r) => setTimeout(r, 4));
    }
  }

  onProgress(96, 'Finalizing 4K stream encoding and packaging video file...');
  mediaRecorder.stop();

  const finalBlob = await recordingPromise;
  onProgress(100, '4K Cinematic Film successfully generated!');
  return finalBlob;
}
