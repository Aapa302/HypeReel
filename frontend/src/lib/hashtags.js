const DEFAULT_GROUP = 'Trending hashtags'

/**
 * Normalises the `hashtags` field of a generation response into labelled groups.
 *
 * The backend currently returns a flat array of strings, so everything lands in
 * a single unlabelled group. Categorised shapes ({ tag, category } items, or a
 * { category: [tags] } object) are already handled here — a future backend
 * enhancement could tag each hashtag with e.g. "Trending Now" vs
 * "Niche-specific" and the UI would group them without further changes.
 */
export function groupHashtags(hashtags) {
  if (!hashtags) return []

  if (Array.isArray(hashtags)) {
    if (hashtags.every((entry) => typeof entry === 'string')) {
      return hashtags.length ? [{ label: null, tags: hashtags }] : []
    }

    const groups = new Map()

    hashtags.forEach((entry) => {
      if (typeof entry === 'string') {
        appendTag(groups, DEFAULT_GROUP, entry)
        return
      }
      const tag = entry?.tag ?? entry?.hashtag ?? entry?.name
      if (!tag) return
      appendTag(groups, entry?.category ?? entry?.type ?? DEFAULT_GROUP, tag)
    })

    return toGroups(groups)
  }

  if (typeof hashtags === 'object') {
    const groups = new Map()
    Object.entries(hashtags).forEach(([category, tags]) => {
      if (!Array.isArray(tags)) return
      tags.forEach((tag) => typeof tag === 'string' && appendTag(groups, category, tag))
    })
    return toGroups(groups)
  }

  return []
}

export function flattenHashtags(groups) {
  return groups.flatMap((group) => group.tags)
}

function appendTag(groups, category, tag) {
  if (!groups.has(category)) groups.set(category, [])
  groups.get(category).push(tag)
}

function toGroups(groups) {
  return Array.from(groups, ([label, tags]) => ({
    label: groups.size > 1 || label !== DEFAULT_GROUP ? label : null,
    tags,
  })).filter((group) => group.tags.length > 0)
}
