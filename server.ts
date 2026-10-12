import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI if key available
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI();
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI with environment variable:', err);
  }
}

// System prompts for cinema director
const CINEMATIC_DIRECTOR_SYSTEM_PROMPT = `You are a master Hollywood cinematographer and director (in the league of Denis Villeneuve, Christopher Nolan, and Roger Deakins).
Your task is to take a film prompt/concept and turn it into a high-octane cinematic storyboard with exact camera movements, shot descriptions, lens focal lengths, character consistency notes, dialogue, audio cues, and lighting moods.

Always return clean, valid JSON without markdown wrapping.`;

// Endpoint: Generate Full Screenplay & Storyboard Breakdown
app.post('/api/generate-screenplay', async (req, res) => {
  const {
    prompt,
    durationTarget = 'trailer_2min', // 'teaser_30s', 'trailer_2min', 'short_5min', 'episode_15min', 'feature_30min'
    style = 'cinematic_photoreal',
    characters = [],
    aspectRatio = '2.39:1',
    tone = 'epic',
  } = req.body;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  // Calculate shot count based on duration target
  let targetShotCount = 6;
  let targetTotalDuration = 120; // seconds

  switch (durationTarget) {
    case 'teaser_30s':
      targetShotCount = 4;
      targetTotalDuration = 30;
      break;
    case 'trailer_2min':
      targetShotCount = 8;
      targetTotalDuration = 120;
      break;
    case 'short_5min':
      targetShotCount = 14;
      targetTotalDuration = 300;
      break;
    case 'episode_15min':
      targetShotCount = 20;
      targetTotalDuration = 900;
      break;
    case 'feature_30min':
      targetShotCount = 26;
      targetTotalDuration = 1800;
      break;
    default:
      targetShotCount = 6;
      targetTotalDuration = 90;
  }

  const userInstruction = `
Create a complete cinematic production breakdown for:
"${prompt}"

Parameters:
- Format / Duration Target: ${durationTarget} (Target total duration: ${targetTotalDuration} seconds, generate ${targetShotCount} key cinematic shots)
- Visual Style: ${style}
- Aspect Ratio: ${aspectRatio}
- Tone / Atmosphere: ${tone}
- Characters Specified: ${JSON.stringify(characters)}

Please output a JSON object with this exact structure:
{
  "title": "Film / Video Title",
  "logline": "One sentence punchy logline",
  "synopsis": "A cinematic paragraph detailing the narrative arc",
  "genre": "Genre (e.g. Sci-Fi Thriller, Epic Fantasy, Neo-Noir)",
  "colorPalette": ["Hex or Color Name 1", "Color 2", "Color 3", "Color 4"],
  "soundtrackTheme": "Ambient description for musical score (e.g., Hans Zimmer deep bass horn braam, melancholic cello with cosmic synthesizers)",
  "characters": [
    {
      "name": "Character Name",
      "tagline": "Brief role/archetype",
      "visualDescription": "High consistency visual prompt details: facial structure, hair, eyes, signature clothing, distinct features",
      "seed": 1000 to 999999
    }
  ],
  "shots": [
    {
      "id": "shot-1",
      "shotNumber": 1,
      "title": "Shot scene title",
      "cameraAngle": "One of: Drone Aerial, Dutch Angle, Extreme Close-Up, Low Angle Hero, Tracking Dolly In, Crane Shot, Steadicam Follow, Macro Focus Pull, 360 Orbit, Over-the-Shoulder, POV",
      "cameraLens": "e.g. 24mm Anamorphic, 35mm Prime, 50mm f/1.2, 85mm Portrait, 200mm Telephoto",
      "cameraMovement": {
        "type": "zoom_in | pan_left | pan_right | tilt_up | tilt_down | dolly_in | dolly_out | orbital | static",
        "speed": 0.5 to 2.0,
        "zoomDelta": 0.05 to 0.35,
        "panDeltaX": -20 to 20,
        "panDeltaY": -20 to 20
      },
      "lighting": "e.g. Golden hour volumetric god-rays, Neon rim lighting with dark shadows, Rain-slicked anamorphic blue flares",
      "sceneDescription": "Detailed visual prompt for AI image/video generator depicting the exact action, character posture, environment, weather, and hyper-detailed textures",
      "visualPrompt": "Optimized realistic prompt for text-to-image generator with camera specifications and visual keywords",
      "characterInShot": "Character Name or 'None'",
      "dialogue": "Optional voiceover or character dialogue line",
      "speaker": "Narrator or Character Name",
      "soundEffect": "Specific sound cue (e.g. thunder rumble, metallic blade clash, futuristic engine whine, rain on asphalt)",
      "duration": 5 to 15,
      "transition": "Cut | Dissolve | Fade to Black | Whip Pan"
    }
  ]
}
`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: userInstruction,
        config: {
          systemInstruction: CINEMATIC_DIRECTOR_SYSTEM_PROMPT,
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });

      const text = response.text;
      if (text) {
        const parsed = JSON.parse(text);
        return res.json({ success: true, data: parsed });
      }
    }
  } catch (err: any) {
    console.error('Gemini API Screenplay Generation error:', err);
    // Fall back smoothly to procedural cinematic generation below
  }

  // Free procedural fallback generator if Gemini API is unavailable or limits reached
  const fallbackData = generateProceduralScreenplay(prompt, durationTarget, style, targetShotCount);
  return res.json({ success: true, data: fallbackData, isFallback: true });
});

// Endpoint: AI Shot Prompt Enhancement & Camera Angle Variation
app.post('/api/enhance-shot', async (req, res) => {
  const { currentPrompt, style = 'photorealistic', angle = 'Low Angle Hero' } = req.body;

  if (!currentPrompt) {
    return res.status(400).json({ error: 'currentPrompt is required' });
  }

  const instruction = `Enhance this cinematic video prompt for a "${angle}" shot in "${style}" style.
Input prompt: "${currentPrompt}"
Output JSON with:
{
  "enhancedPrompt": "Extremely detailed 8K cinematic rendering prompt with lighting, 35mm film grain, volumetric atmosphere, exact subject placement, dynamic composition",
  "cameraNotes": "Director instructions for focal depth, motion speed, and framing",
  "suggestedLighting": "Lighting setup"
}`;

  try {
    if (aiClient) {
      const response = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: instruction,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      });
      if (response.text) {
        return res.json({ success: true, data: JSON.parse(response.text) });
      }
    }
  } catch (err) {
    console.warn('Enhance shot fallback:', err);
  }

  // Fallback
  return res.json({
    success: true,
    data: {
      enhancedPrompt: `Ultra-photorealistic 8K cinematic still, ${currentPrompt}, shot on ARRI Alexa 65 with Cooke Anamorphic lens, ${angle}, dramatic volumetric haze, hyper-detailed textures, subtle 35mm film grain, masterpiece cinema grading`,
      cameraNotes: `${angle} with slow 1.2x continuous push-in and subtle handheld micro-shake for organic realism.`,
      suggestedLighting: `Chiaroscuro high-contrast lighting with crisp rim light and atmospheric fog.`,
    },
  });
});

// Helper for procedural screenplay generation (100% free, reliable, offline-safe)
function generateProceduralScreenplay(
  userPrompt: string,
  durationTarget: string,
  style: string,
  shotCount: number
) {
  const angles = [
    'Drone Aerial',
    'Low Angle Hero',
    'Tracking Dolly In',
    'Dutch Angle',
    'Extreme Close-Up',
    'Crane Shot',
    '360 Orbit',
    'Steadicam Follow',
    'Macro Focus Pull',
  ];

  const lenses = [
    '24mm Anamorphic f/2.0',
    '35mm Panavision Prime',
    '50mm f/1.2 Master Prime',
    '85mm Portrait Cine-Lens',
    '200mm Telephoto Compression',
  ];

  const movements: Array<{
    type: 'zoom_in' | 'pan_left' | 'pan_right' | 'tilt_up' | 'tilt_down' | 'dolly_in' | 'dolly_out' | 'orbital';
    speed: number;
    zoomDelta: number;
    panDeltaX: number;
    panDeltaY: number;
  }> = [
    { type: 'zoom_in', speed: 1.0, zoomDelta: 0.18, panDeltaX: 0, panDeltaY: 0 },
    { type: 'dolly_in', speed: 1.2, zoomDelta: 0.25, panDeltaX: -5, panDeltaY: 2 },
    { type: 'pan_right', speed: 0.9, zoomDelta: 0.08, panDeltaX: 18, panDeltaY: 0 },
    { type: 'tilt_up', speed: 1.1, zoomDelta: 0.12, panDeltaX: 0, panDeltaY: -15 },
    { type: 'orbital', speed: 1.3, zoomDelta: 0.15, panDeltaX: 12, panDeltaY: 8 },
    { type: 'dolly_out', speed: 0.8, zoomDelta: -0.15, panDeltaX: 0, panDeltaY: 0 },
  ];

  const shots = [];
  const baseSeed = Math.floor(Math.random() * 899999) + 100000;

  for (let i = 0; i < shotCount; i++) {
    const angle = angles[i % angles.length];
    const lens = lenses[i % lenses.length];
    const movement = movements[i % movements.length];
    const duration = Math.round(180 / shotCount) > 10 ? 8 : 6;

    shots.push({
      id: `shot-${i + 1}`,
      shotNumber: i + 1,
      title: `Sequence ${i + 1}: ${angle} Perspective`,
      cameraAngle: angle,
      cameraLens: lens,
      cameraMovement: movement,
      lighting: i % 2 === 0 ? 'Volumetric golden hour with deep chiaroscuro rim lighting' : 'Moody anamorphic neon glow with atmospheric rain mist',
      sceneDescription: `${userPrompt}, sequence ${i + 1}, cinematic composition, 8k resolution, IMAX film still, ${angle}`,
      visualPrompt: `Masterpiece cinematic 8k film still, ${userPrompt}, shot on 65mm IMAX anamorphic lens, ${angle}, ${lens}, shallow depth of field, photorealistic, intricate detail, cinematic color grading, hyper-detailed textures`,
      characterInShot: 'Protagonist',
      dialogue: i === 0 ? 'Every journey begins at the edge of the unknown.' : i === shotCount - 1 ? 'There is no turning back now.' : `Witness the unfolding of the horizon.`,
      speaker: 'Narrator',
      soundEffect: i % 2 === 0 ? 'Deep cinematic sub-bass braam swell' : 'Atmospheric wind howling through metallic structures',
      duration: duration,
      transition: i === shotCount - 1 ? 'Fade to Black' : 'Dissolve',
    });
  }

  return {
    title: userPrompt.length > 30 ? userPrompt.slice(0, 30) + '...' : userPrompt,
    logline: `A visually stunning cinematic odyssey exploring ${userPrompt}.`,
    synopsis: `An epic visual narrative bringing the vision of "${userPrompt}" to life across multi-perspective camera angles, realistic lighting, and intense cinematic storytelling.`,
    genre: 'Cinematic Epic / Sci-Fi Drama',
    colorPalette: ['#0A1128', '#001F54', '#034078', '#1282A2', '#FEFCFB'],
    soundtrackTheme: 'Dynamic cinematic orchestral score with deep resonant braams and ambient synthscapes',
    characters: [
      {
        name: 'Protagonist',
        tagline: 'The Central Figure',
        visualDescription: 'Consistent protagonist with striking eyes, weathered explorer jacket, determined expression, cinematic rim lighting',
        seed: baseSeed,
      },
    ],
    shots,
  };
}

// Free AI Image Proxy Endpoint (CORS-safe, Zero credits)
app.get('/api/proxy-image', async (req, res) => {
  const { prompt, seed, width = '1920', height = '1080', model = 'flux' } = req.query;

  if (!prompt || typeof prompt !== 'string') {
    return res.status(400).send('Prompt parameter required');
  }

  const encodedPrompt = encodeURIComponent(prompt);
  const cleanSeed = seed ? encodeURIComponent(seed.toString()) : Math.floor(Math.random() * 999999);
  const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&seed=${cleanSeed}&nologo=true&model=${model}`;

  try {
    const fetchRes = await fetch(pollinationsUrl, {
      headers: {
        'User-Agent': 'CineForgeAI/1.0',
      },
    });

    if (!fetchRes.ok) {
      return res.redirect(pollinationsUrl);
    }

    const contentType = fetchRes.headers.get('content-type') || 'image/jpeg';
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');

    const arrayBuffer = await fetchRes.arrayBuffer();
    return res.send(Buffer.from(arrayBuffer));
  } catch (err) {
    // If proxy fetch fails, redirect directly to image url
    return res.redirect(pollinationsUrl);
  }
});

// App server & Vite middleware
async function startServer() {
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CineForge AI Studio active on port ${PORT}`);
  });
}

startServer();
