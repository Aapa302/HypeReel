const fs = require('fs');
const os = require('os');
const path = require('path');
const crypto = require('crypto');

const { GoogleGenerativeAI } = require('@google/generative-ai');
const { GoogleAIFileManager, FileState } = require('@google/generative-ai/server');

const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

function getApiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GEMINI_API_KEY environment variable.');
  }
  return apiKey;
}

function getClient() {
  return new GoogleGenerativeAI(getApiKey());
}

function extractJson(text) {
  const cleaned = text.replace(/```(?:json)?/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) {
    throw new Error(`Could not parse JSON from Gemini response: ${text}`);
  }
  return JSON.parse(cleaned.slice(start, end + 1));
}

async function uploadToGemini(file) {
  const fileManager = new GoogleAIFileManager(getApiKey());

  const tmpPath = path.join(
    os.tmpdir(),
    `hypereel-${crypto.randomUUID()}${path.extname(file.originalname) || '.mp4'}`
  );

  try {
    await fs.promises.writeFile(tmpPath, file.buffer);

    const uploadResult = await fileManager.uploadFile(tmpPath, {
      mimeType: file.mimetype,
      displayName: file.originalname,
    });

    let geminiFile = uploadResult.file;
    while (geminiFile.state === FileState.PROCESSING) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      geminiFile = await fileManager.getFile(geminiFile.name);
    }

    if (geminiFile.state !== FileState.ACTIVE) {
      throw new Error(`Gemini failed to process the video (state: ${geminiFile.state}).`);
    }

    return geminiFile;
  } finally {
    await fs.promises.unlink(tmpPath).catch(() => {});
  }
}

async function generateCaptions(file) {
  const geminiFile = await uploadToGemini(file);

  const model = getClient().getGenerativeModel({ model: MODEL_NAME });

  const prompt = `Watch this video and generate TWO captions for a social media post.

Respond ONLY with valid JSON in exactly this format:
{
  "descriptiveCaption": "A clear, descriptive caption explaining what is happening in the video.",
  "viralCaption": "A catchy, viral-style caption with a strong hook line and emojis, ready to post."
}`;

  const result = await model.generateContent([
    {
      fileData: {
        mimeType: geminiFile.mimeType,
        fileUri: geminiFile.uri,
      },
    },
    { text: prompt },
  ]);

  const parsed = extractJson(result.response.text());

  if (!parsed.descriptiveCaption || !parsed.viralCaption) {
    throw new Error('Gemini response missing expected caption fields.');
  }

  return {
    descriptiveCaption: parsed.descriptiveCaption,
    viralCaption: parsed.viralCaption,
  };
}

async function fetchTrendingHashtags() {
  const model = getClient().getGenerativeModel({
    model: MODEL_NAME,
    tools: [{ googleSearch: {} }],
  });

  const prompt = `Using web search, find hashtags that are currently trending across social media platforms (TikTok, Instagram Reels, YouTube Shorts, X) today.

Respond ONLY with valid JSON in exactly this format:
{
  "hashtags": ["#tag1", "#tag2", "#tag3", ...]
}

Include 25-40 trending hashtags. Each must start with '#' and contain no spaces.`;

  const result = await model.generateContent(prompt);
  const parsed = extractJson(result.response.text());

  if (!Array.isArray(parsed.hashtags) || parsed.hashtags.length === 0) {
    throw new Error('Gemini response missing trending hashtags.');
  }

  return parsed.hashtags
    .filter((tag) => typeof tag === 'string' && tag.trim().length > 1)
    .map((tag) => (tag.startsWith('#') ? tag : `#${tag}`).replace(/\s+/g, ''));
}

async function selectRelevantHashtags(trendingHashtags, captionContext) {
  const model = getClient().getGenerativeModel({ model: MODEL_NAME });

  const prompt = `Here is a list of currently trending hashtags:
${trendingHashtags.join(' ')}

Here is the caption content of a video:
"${captionContext}"

Select the 8-10 hashtags from the trending list above that are MOST relevant to this video's content. If very few are relevant, you may also include broadly applicable trending hashtags to reach at least 8.

Respond ONLY with valid JSON in exactly this format:
{
  "hashtags": ["#tag1", "#tag2", ...]
}`;

  const result = await model.generateContent(prompt);
  const parsed = extractJson(result.response.text());

  if (!Array.isArray(parsed.hashtags) || parsed.hashtags.length === 0) {
    throw new Error('Gemini response missing selected hashtags.');
  }

  return parsed.hashtags.slice(0, 10);
}

module.exports = { generateCaptions, fetchTrendingHashtags, selectRelevantHashtags };
