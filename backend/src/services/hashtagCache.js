const { fetchTrendingHashtags } = require('./gemini');

const CACHE_TTL_MS = 3 * 60 * 60 * 1000; // 3 hours

let cache = {
  hashtags: null,
  fetchedAt: 0,
};

let pendingFetch = null;

async function getTrendingHashtags() {
  const now = Date.now();

  if (cache.hashtags && now - cache.fetchedAt < CACHE_TTL_MS) {
    return cache.hashtags;
  }

  // Deduplicate concurrent refreshes.
  if (!pendingFetch) {
    pendingFetch = fetchTrendingHashtags()
      .then((hashtags) => {
        cache = { hashtags, fetchedAt: Date.now() };
        return hashtags;
      })
      .finally(() => {
        pendingFetch = null;
      });
  }

  try {
    return await pendingFetch;
  } catch (err) {
    // Fall back to stale cache if the refresh fails.
    if (cache.hashtags) {
      return cache.hashtags;
    }
    throw err;
  }
}

function clearCache() {
  cache = { hashtags: null, fetchedAt: 0 };
  pendingFetch = null;
}

module.exports = { getTrendingHashtags, clearCache, CACHE_TTL_MS };
