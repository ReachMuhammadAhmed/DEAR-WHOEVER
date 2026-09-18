import { Postcard, StampType } from '../types';
import { CANVAS_SIZE, DEFAULT_BG_COLOR } from '../utils/pixelUtils';

// Helper to create 32x32 flat pixel array from visual string patterns or functions
function makeGrid(fn: (x: number, y: number) => string): string[] {
  const pixels: string[] = [];
  for (let y = 0; y < CANVAS_SIZE; y++) {
    for (let x = 0; x < CANVAS_SIZE; x++) {
      pixels.push(fn(x, y));
    }
  }
  return pixels;
}

// 1. Mountain Sunset
const mountainSunset = makeGrid((x, y) => {
  if (y < 8) return '#312E81'; // Deep indigo night
  if (y < 13) return '#6D28D9'; // Purple twilight
  if (y < 17) return '#DB2777'; // Magenta sunset
  if (y < 21) {
    // Sun setting
    const dx = x - 16;
    const dy = y - 19;
    if (dx * dx + dy * dy <= 20) return '#FDE047'; // Bright yellow sun
    return '#F97316'; // Orange glow
  }
  // Mountains
  const m1 = Math.abs(x - 10) + 21;
  const m2 = Math.abs(x - 22) + 19;
  if (y >= m1 || y >= m2) {
    if (y === m1 || y === m2) return '#1E1B4B'; // Ridge line
    if (y > 27) return '#064E3B'; // Dark pine valley
    return '#0F172A'; // Mountain body
  }
  return '#FB923C';
});

// 2. Sleeping Cozy Orange Cat
const sleepingCat = makeGrid((x, y) => {
  // Cozy wooden floor / rug
  const isRug = Math.pow((x - 16) / 14, 2) + Math.pow((y - 18) / 10, 2) <= 1;
  if (!isRug) return '#FEF3C7'; // Warm floor

  // Cat body circle
  const catDist = Math.pow((x - 15) / 9, 2) + Math.pow((y - 18) / 7, 2);
  // Head
  const headDist = Math.pow((x - 21) / 5, 2) + Math.pow((y - 16) / 5, 2);
  // Ears
  const isLeftEar = (x === 20 || x === 21) && (y === 10 || y === 11);
  const isRightEar = (x === 24 || x === 25) && (y === 11 || y === 12);
  // Tail curled
  const isTail = (x >= 6 && x <= 10 && y >= 20 && y <= 22) || (x >= 5 && x <= 7 && y >= 17 && y <= 20);

  if (isLeftEar || isRightEar) return '#EA580C';
  if (headDist <= 1) {
    // Sleeping closed eye
    if (x === 22 && y === 16) return '#451A03';
    if (x === 23 && y === 17) return '#451A03';
    // Pink nose
    if (x === 24 && y === 18) return '#F472B6';
    return '#F97316';
  }
  if (catDist <= 1 || isTail) {
    // Stripes
    if ((x + y) % 5 === 0) return '#C2410C';
    return '#F97316';
  }

  // Rug pattern
  if ((x + y) % 2 === 0) return '#E0E7FF';
  return '#C7D2FE';
});

// 3. Steaming Coffee Cup
const coffeeCup = makeGrid((x, y) => {
  // Background
  if (y < 12) {
    // Steam curls
    if ((x === 14 && (y === 6 || y === 7)) || (x === 15 && (y === 8 || y === 9))) return '#D6D3D1';
    if ((x === 18 && (y === 4 || y === 5)) || (x === 17 && (y === 6 || y === 7)) || (x === 18 && (y === 8 || y === 9))) return '#E7E5E4';
    return '#F5F5F4';
  }
  // Table
  if (y >= 26) return '#D97706';

  // Cup body
  const inCup = x >= 10 && x <= 22 && y >= 14 && y <= 24;
  const inHandle = x >= 22 && x <= 26 && y >= 16 && y <= 22;
  const inHandleHole = x >= 23 && x <= 24 && y >= 18 && y <= 20;

  if (inHandle && !inHandleHole) return '#0284C7';
  if (inCup) {
    // Cup rim / liquid
    if (y === 14) return '#78350F';
    // Heart latte art
    if (y >= 17 && y <= 20 && x >= 14 && x <= 18) {
      if ((y === 17 && (x === 15 || x === 17)) || (y === 18 && x >= 14 && x <= 18) || (y === 19 && x >= 15 && x <= 17) || (y === 20 && x === 16)) {
        return '#FFFFFF';
      }
    }
    return '#0284C7';
  }

  // Saucer
  if (y === 25 && x >= 7 && x <= 25) return '#0369A1';

  return '#F5F5F4';
});

// 4. Crescent Moon & Stars
const starryNight = makeGrid((x, y) => {
  // Night sky gradient
  const bg = y < 16 ? '#0F172A' : '#1E1B4B';
  // Stars
  if ((x === 6 && y === 6) || (x === 25 && y === 8) || (x === 8 && y === 22) || (x === 24 && y === 26) || (x === 16 && y === 4)) {
    return '#FEF08A';
  }
  if ((x === 12 && y === 12) || (x === 28 && y === 18) || (x === 4 && y === 16)) {
    return '#FFFFFF';
  }

  // Crescent moon
  const moonDist = Math.pow(x - 16, 2) + Math.pow(y - 15, 2);
  const shadowDist = Math.pow(x - 19, 2) + Math.pow(y - 13, 2);
  if (moonDist <= 55 && shadowDist > 45) {
    return '#FDE047';
  }

  // Soft clouds at bottom
  if (y >= 27) {
    if (y === 27 && (x % 6 === 0 || x % 6 === 1)) return '#334155';
    return '#1E293B';
  }

  return bg;
});

// 5. Lighthouse by the Sea
const lighthouse = makeGrid((x, y) => {
  // Sky
  if (y < 20) {
    // Light beam
    const beam = x > 16 && Math.abs((y - 8) - (x - 16) * 0.35) < 3;
    if (beam) return '#FEF9C3';
    return '#1E293B';
  }
  // Sea
  if (y >= 24) {
    if ((x + y) % 4 === 0) return '#38BDF8';
    return '#0369A1';
  }
  // Rocks
  if (x < 18 && y >= 20) return '#475569';

  // Lighthouse tower
  if (x >= 13 && x <= 17 && y >= 7 && y <= 21) {
    if (y < 10) return '#FBBF24'; // Lantern room
    if ((y >= 10 && y <= 13) || (y >= 17 && y <= 19)) return '#EF4444'; // Red stripe
    return '#FFFFFF'; // White stripe
  }

  return '#1E293B';
});

// 6. Cherry Blossom Branch
const cherryBlossom = makeGrid((x, y) => {
  // Branch
  const isBranch = (y === Math.floor(x * 0.4) + 12) || (y === Math.floor(x * 0.35) + 13);
  const isTwig = (x >= 14 && x <= 22 && y === 24 - Math.floor(x * 0.3));

  if (isBranch || isTwig) return '#582C0E';

  // Blossoms (clusters)
  const centers = [
    [10, 15], [16, 17], [22, 20], [25, 14], [18, 23], [8, 11]
  ];

  for (const [cx, cy] of centers) {
    const d = Math.pow(x - cx, 2) + Math.pow(y - cy, 2);
    if (d <= 1) return '#F43F5E'; // Deep petal center
    if (d <= 5) return '#FDA4AF'; // Pink petal
  }

  // Falling petals
  if ((x === 6 && y === 22) || (x === 13 && y === 26) || (x === 28 && y === 25)) {
    return '#FDA4AF';
  }

  return '#FDF4FF'; // Soft blossom mist background
});

// 7. Little Red Amanita Mushroom
const mushroom = makeGrid((x, y) => {
  // Ground
  if (y >= 26) return '#15803D';
  if (y >= 25 && (x % 3 === 0)) return '#22C55E';

  // Stem
  if (x >= 14 && x <= 18 && y >= 17 && y <= 25) return '#F5F5F4';

  // Cap
  const capDist = Math.pow((x - 16) / 9, 2) + Math.pow((y - 16) / 7, 2);
  if (capDist <= 1 && y <= 17) {
    // White polka dots
    if ((x === 16 && y === 12) || (x === 11 && y === 14) || (x === 21 && y === 14) || (x === 14 && y === 15) || (x === 18 && y === 15)) {
      return '#FFFFFF';
    }
    return '#DC2626';
  }

  return '#FEF9C3';
});

// 8. Ramen Bowl
const ramenBowl = makeGrid((x, y) => {
  if (y < 8) return '#FFFBEB';
  // Chopsticks
  if (y <= 12 && Math.abs((x - 20) + (y - 8)) <= 0.8) return '#B45309';

  // Broth / bowl top
  if (y >= 13 && y <= 16 && x >= 8 && x <= 24) {
    // Egg
    if (x >= 12 && x <= 16 && y >= 13 && y <= 15) {
      if (x === 14 && y === 14) return '#F59E0B'; // Yolk
      return '#FFFFFF'; // White
    }
    // Green scallions
    if ((x === 19 && y === 14) || (x === 21 && y === 15)) return '#16A34A';
    // Noodles
    return '#FDE68A';
  }

  // Ceramic Bowl
  const inBowl = Math.pow((x - 16) / 10, 2) + Math.pow((y - 15) / 10, 2) <= 1 && y >= 16 && y <= 26;
  if (inBowl) {
    if (y === 16 || y === 26) return '#1E3A8A';
    if (x === 16) return '#3B82F6';
    return '#2563EB';
  }

  return '#FFFBEB';
});

// 9. Retro Pixel Gameboy
const retroGameboy = makeGrid((x, y) => {
  // Background
  if (x < 7 || x > 25 || y < 4 || y > 28) return '#F3F4F6';

  // Device body
  if (y >= 4 && y <= 28 && x >= 8 && x <= 24) {
    // Screen area
    if (y >= 8 && y <= 18 && x >= 10 && x <= 22) {
      // Screen bezel
      if (x === 10 || x === 22 || y === 8 || y === 18) return '#4B5563';
      // Screen green pixel heart
      if (y >= 11 && y <= 15 && x >= 13 && x <= 19) {
        if ((y === 11 && (x === 14 || x === 18)) || (y === 12 && x >= 13 && x <= 19) || (y === 13 && x >= 14 && x <= 18) || (y === 14 && x >= 15 && x <= 17) || (y === 15 && x === 16)) {
          return '#064E3B';
        }
      }
      return '#86EFAC';
    }

    // D-pad
    if (x >= 10 && x <= 14 && y >= 21 && y <= 25) {
      if (x === 12 || y === 23) return '#1F2937';
    }

    // A/B Buttons
    if ((x === 20 && y === 24) || (x === 22 && y === 22)) return '#BE123C';

    return '#9CA3AF'; // Classic gray shell
  }

  return '#F3F4F6';
});

// 10. Little Camper Van under Sunrise
const camperVan = makeGrid((x, y) => {
  // Sky
  if (y < 14) return '#FFEDD5';
  // Ground
  if (y >= 26) return '#4ADE80';

  // Sun
  if (x >= 4 && x <= 10 && y >= 8 && y <= 13) return '#FBBF24';

  // Camper Van body
  if (x >= 10 && x <= 25 && y >= 15 && y <= 24) {
    // Windows
    if (y >= 16 && y <= 19 && (x >= 12 && x <= 16 || x >= 19 && x <= 23)) return '#60A5FA';
    // Wheels
    if (y >= 23 && y <= 25 && (x >= 12 && x <= 15 || x >= 21 && x <= 24)) return '#111827';
    // Lower stripe
    if (y >= 20 && y <= 22) return '#059669';
    return '#FFFFFF';
  }

  return '#FEF3C7';
});

export const SEED_POSTCARDS: Postcard[] = [
  {
    id: 'seed-1',
    title: 'Twilight Over the Pines',
    pixels: mountainSunset,
    sender: 'A Wandering Hiker',
    location: 'Kyoto, Japan',
    message: 'Paused on the mountain pass just as the dusk set the sky on fire. May your day end gently.',
    stampType: 'mountain',
    stampColor: '#DC2626',
    createdAt: Date.now() - 1000 * 60 * 18,
    likes: 42,
  },
  {
    id: 'seed-2',
    title: 'Mochi Taking a Nap',
    pixels: sleepingCat,
    sender: 'Tea Drinker',
    location: 'Amsterdam, Netherlands',
    message: 'My cat found the one warm sunbeam on the carpet. Sending you some sleepy peacefulness.',
    stampType: 'cat',
    stampColor: '#EA580C',
    createdAt: Date.now() - 1000 * 60 * 35,
    likes: 89,
  },
  {
    id: 'seed-3',
    title: 'First Morning Roast',
    pixels: coffeeCup,
    sender: 'Corner Cafe Barista',
    location: 'Melbourne, Australia',
    message: 'Poured a lucky heart latte before the morning rush. Take a slow sip and breathe.',
    stampType: 'coffee',
    stampColor: '#0284C7',
    createdAt: Date.now() - 1000 * 60 * 55,
    likes: 67,
  },
  {
    id: 'seed-4',
    title: 'Starlit Crescent',
    pixels: starryNight,
    sender: 'Midnight Astronomer',
    location: 'Reykjavik, Iceland',
    message: 'The winter stars are crystal clear tonight. You and I look up at the very same moon.',
    stampType: 'star',
    stampColor: '#4F46E5',
    createdAt: Date.now() - 1000 * 60 * 90,
    likes: 124,
  },
  {
    id: 'seed-5',
    title: 'The Atlantic Beacon',
    pixels: lighthouse,
    sender: 'Keeper of the Light',
    location: 'Peggy’s Cove, Canada',
    message: 'Fog is rolling in over the bay, but the beacon turns on without fail. Keep shining.',
    stampType: 'lighthouse',
    stampColor: '#EF4444',
    createdAt: Date.now() - 1000 * 60 * 140,
    likes: 53,
  },
  {
    id: 'seed-6',
    title: 'Spring Bloom Branch',
    pixels: cherryBlossom,
    sender: 'Gardener in Spring',
    location: 'Nara, Japan',
    message: 'First blossoms broke open along the stone wall this afternoon. Spring is never late.',
    stampType: 'botanical',
    stampColor: '#EC4899',
    createdAt: Date.now() - 1000 * 60 * 210,
    likes: 95,
  },
  {
    id: 'seed-7',
    title: 'Forest Amanita',
    pixels: mushroom,
    sender: 'Mushroom Forager',
    location: 'Black Forest, Germany',
    message: 'Found hidden under a damp mossy log. Tiny things have the most wondrous architecture.',
    stampType: 'botanical',
    stampColor: '#DC2626',
    createdAt: Date.now() - 1000 * 60 * 320,
    likes: 38,
  },
  {
    id: 'seed-8',
    title: 'Steaming Tonkotsu',
    pixels: ramenBowl,
    sender: 'Night Owl Diner',
    location: 'Osaka, Japan',
    message: '3 AM noodles after a long shift. Warm broth heals everything. Eat something tasty today!',
    stampType: 'coffee',
    stampColor: '#2563EB',
    createdAt: Date.now() - 1000 * 60 * 450,
    likes: 78,
  },
  {
    id: 'seed-9',
    title: 'Pocket Nostalgia',
    pixels: retroGameboy,
    sender: 'Pixel Archaeologist',
    location: 'Akihabara, Tokyo',
    message: 'Found my old handheld in a cardboard box. Still had one bar of AA battery life left!',
    stampType: 'heart',
    stampColor: '#BE123C',
    createdAt: Date.now() - 1000 * 60 * 600,
    likes: 112,
  },
  {
    id: 'seed-10',
    title: 'Pacific Highway Camper',
    pixels: camperVan,
    sender: 'Coastline Nomad',
    location: 'Big Sur, California',
    message: 'Woke up to the ocean breeze and fresh oranges. The open road has space for all of us.',
    stampType: 'sun',
    stampColor: '#059669',
    createdAt: Date.now() - 1000 * 60 * 780,
    likes: 83,
  },
];

// Curated list of stranger locations and personas for dynamic exchanges
const STRANGER_LOCATIONS = [
  'Kyoto, Japan', 'Valparaíso, Chile', 'Reykjavik, Iceland', 'Bergen, Norway',
  'Oaxaca, Mexico', 'Taipei, Taiwan', 'Edinburgh, Scotland', 'Lisbon, Portugal',
  'Wellington, New Zealand', 'Portland, Oregon', 'Vienna, Austria', 'Stockholm, Sweden',
  'Seoul, South Korea', 'Montreal, Canada', 'Ubud, Bali', 'Zurich, Switzerland'
];

const STRANGER_SENDERS = [
  'A Sleepy Poet', 'Train Window Dreamer', 'Bookshop Clerk', 'Midnight Baker',
  'Tea House Regular', 'Cloud Watcher', 'Analog Photographer', 'Late Night Coder',
  'Bicycle Courier', 'Botanical Sketcher', 'Rainy Day Artist', 'Quiet Observer'
];

const STRANGER_MESSAGES = [
  'Hope this little square of pixels brings a genuine smile to your afternoon.',
  'Drawn while sipping Earl Grey and listening to rain patter against the skylight.',
  'Strange to think a stranger across the earth is holding this miniature piece of art right now.',
  'No matter where you are in the world, sending you warmth and creative energy today.',
  'May your tea stay hot, your commute be swift, and your heart be light.',
  'I wonder what the weather is doing outside your window as you read this.',
  'A tiny token from my desk to yours. Keep making things with your hands.',
  'Sent into the ether with good intentions. I hope it found the right human.'
];

const STAMP_TYPES: StampType[] = ['sun', 'mountain', 'cat', 'coffee', 'botanical', 'star', 'cloud', 'heart', 'lighthouse'];
const STAMP_COLORS = ['#DC2626', '#EA580C', '#D97706', '#059669', '#0284C7', '#4F46E5', '#9333EA', '#EC4899'];

// Generate a stranger postcard in exchange, with clear previous participant attribution
export function createRandomStrangerExchangePostcard(
  options: {
    isFromPreviousStranger?: boolean;
    pool?: Postcard[];
  } = {}
): Postcard {
  const isFromPrevious = options.isFromPreviousStranger ?? true;

  // If a pool of existing postcards is provided, pick a random postcard from previous participants
  if (options.pool && options.pool.length > 0) {
    const candidatePool = options.pool.filter((p) => !p.isUserSent);
    if (candidatePool.length > 0) {
      const selected = candidatePool[Math.floor(Math.random() * candidatePool.length)];
      return {
        ...selected,
        id: 'previous-stranger-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
        isUserReceived: true,
        isFromPreviousStranger: isFromPrevious,
        sourceLabel: isFromPrevious ? 'From a previous stranger' : undefined,
      };
    }
  }

  // Pick a base template or procedural variation from our historical archive
  const templates = [
    { title: 'Morning Mountain Breeze', art: mountainSunset },
    { title: 'Purring in the Sunbeam', art: sleepingCat },
    { title: 'Fresh Brew at Dawn', art: coffeeCup },
    { title: 'Constellations Above', art: starryNight },
    { title: 'Guiding Light Over Shoals', art: lighthouse },
    { title: 'Blossom on the Breeze', art: cherryBlossom },
    { title: 'Little Forest Spore', art: mushroom },
    { title: 'Warm Broth at Midnight', art: ramenBowl },
    { title: '8-Bit Heartstrings', art: retroGameboy },
    { title: 'Wanderer by the Sea', art: camperVan },
  ];

  const chosen = templates[Math.floor(Math.random() * templates.length)];
  const location = STRANGER_LOCATIONS[Math.floor(Math.random() * STRANGER_LOCATIONS.length)];
  const sender = STRANGER_SENDERS[Math.floor(Math.random() * STRANGER_SENDERS.length)];
  const message = STRANGER_MESSAGES[Math.floor(Math.random() * STRANGER_MESSAGES.length)];
  const stampType = STAMP_TYPES[Math.floor(Math.random() * STAMP_TYPES.length)];
  const stampColor = STAMP_COLORS[Math.floor(Math.random() * STAMP_COLORS.length)];

  return {
    id: 'stranger-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    title: chosen.title,
    pixels: [...chosen.art],
    sender,
    location,
    message,
    stampType,
    stampColor,
    createdAt: Date.now() - (Math.floor(Math.random() * 86400000 * 5) + 3600000), // Previous participant date
    isUserReceived: true,
    isFromPreviousStranger: isFromPrevious,
    sourceLabel: isFromPrevious ? 'From a previous stranger' : undefined,
    likes: Math.floor(Math.random() * 15) + 3,
  };
}
