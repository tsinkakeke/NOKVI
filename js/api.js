
export const YOUTUBE_API_KEY = 'AIzaSyBjeEJri_61eiuFz5Epu2WkSmr61ZvioBA';

const YT_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';

// ─── Demo placeholder videos (shown when no API key is set) ───────────────────
const DEMO_VIDEOS = [
  {
    id: 'demo1',
    title: 'Beginner Crochet: Your First Granny Square',
    channel: 'Yarn & Hook Studio',
    description: 'Learn to make a classic granny square from scratch — perfect for total beginners. No experience needed!',
    thumbnail: null,
    url: 'https://www.youtube.com/results?search_query=beginner+crochet+granny+square',
  },
  {
    id: 'demo2',
    title: 'Easy Knit Beanie — 1 Hour Project',
    channel: 'The Cozy Knitter',
    description: 'A quick and satisfying beginner knitting project. Cast on, knit in the round, and finish a warm hat.',
    thumbnail: null,
    url: 'https://www.youtube.com/results?search_query=easy+knit+beanie+tutorial',
  },
  {
    id: 'demo3',
    title: 'Amigurumi Basics: Crochet a Tiny Bear',
    channel: 'Soft Stitch Creations',
    description: 'Step-by-step guide to your first amigurumi. Covers magic ring, single crochet, and stuffing techniques.',
    thumbnail: null,
    url: 'https://www.youtube.com/results?search_query=amigurumi+crochet+bear+tutorial',
  },
  {
    id: 'demo4',
    title: 'Cable Knit Scarf — Classic Pattern',
    channel: 'Needles & Wool',
    description: 'Master the cable stitch with this cozy scarf project. Includes detailed slow-motion technique shots.',
    thumbnail: null,
    url: 'https://www.youtube.com/results?search_query=cable+knit+scarf+tutorial',
  },
  {
    id: 'demo5',
    title: 'Crochet Blanket for Beginners',
    channel: 'Loop & Stitch',
    description: 'Make a large, chunky blanket using only the basic single and double crochet stitches.',
    thumbnail: null,
    url: 'https://www.youtube.com/results?search_query=beginner+crochet+blanket',
  },
  {
    id: 'demo6',
    title: 'Knitting Reading Your Knitting — Fix Mistakes',
    channel: 'The Yarn Whisperer',
    description: 'Learn how to spot and fix the most common knitting mistakes without unraveling your entire work.',
    thumbnail: null,
    url: 'https://www.youtube.com/results?search_query=fix+knitting+mistakes+tutorial',
  },
];

/**
 * Fetch videos from YouTube Data API v3.
 * @param {string} query - Search query
 * @param {number} maxResults - Max results to return
 * @returns {Promise<Array>} - Array of video objects
 */
export async function fetchVideos(query, maxResults = 9) {
  if (!YOUTUBE_API_KEY) {
     // Return demo data after a simulated delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return DEMO_VIDEOS;
  }

  const params = new URLSearchParams({
    part: 'snippet',
    q: query,
    type: 'video',
    maxResults: String(maxResults),
    key: YOUTUBE_API_KEY,
    relevanceLanguage: 'en',
  });

  const response = await fetch(`${YT_SEARCH_URL}?${params}`);

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error ${response.status}`);
  }

  const data = await response.json();

  return data.items.map(item => ({
    id: item.id.videoId,
    title: item.snippet.title,
    channel: item.snippet.channelTitle,
    description: item.snippet.description,
    thumbnail: item.snippet.thumbnails?.medium?.url || null,
    url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
  }));
}

/**
 * Closure: debounce — delays calling `fn` until `delay` ms after the last call.
 * Used to avoid firing an API search on every keystroke.
 *
 * @param {Function} fn - The function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} - Debounced version of fn
 */
export function debounce(fn, delay) {
  let timerId;
  return function (...args) {
    clearTimeout(timerId);
    timerId = setTimeout(() => fn.apply(this, args), delay);
  };
}
