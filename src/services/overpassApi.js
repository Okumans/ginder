// Live restaurant lookup via the Overpass API (OpenStreetMap).
// No API key, CORS-enabled, free — the only realistic "live data" source
// for a client-only app with no backend to hide credentials behind.
// Trade-off: OSM coverage/tagging in Bangkok is crowd-sourced and uneven,
// so results won't be as complete or as richly described as curated data.

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const FETCH_TIMEOUT_MS = 12000;

// OSM's free-text `cuisine` tag (semicolon-separated) mapped onto the
// app's existing tag vocabulary so live results mix naturally with mocks.
const CUISINE_KEYWORD_TO_TAG = [
  [/thai/, 'Thai'],
  [/japan|sushi|ramen|izakaya/, 'Japanese'],
  [/italian|pizza/, 'Italian'],
  [/pizza/, 'Pizza'],
  [/pasta/, 'Pasta'],
  [/chinese|dim_?sum/, 'Chinese'],
  [/korean/, 'Korean'],
  [/indian|curry/, 'Indian'],
  [/vietnamese/, 'Vietnamese'],
  [/burger/, 'Burgers'],
  [/bbq|barbecue|grill|yakiniku|steak/, 'BBQ'],
  [/noodle|ramen|pho/, 'Noodles'],
  [/seafood|fish/, 'Seafood'],
  [/dessert|cake|bakery|ice_cream/, 'Dessert'],
  [/coffee|cafe/, 'Cafe'],
  [/street/, 'Street Food'],
  [/buffet|hot_pot|shabu|steamboat/, 'Buffet'],
  [/western|american|international/, 'Western'],
];

// Representative Unsplash food photos per tag — OSM has no verified photos
// of these exact venues, so these are illustrative, not literal.
const IMAGE_POOL_BY_TAG = {
  Thai: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80'],
  Japanese: ['https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=800&q=80'],
  Italian: ['https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=800&q=80'],
  Chinese: ['https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=800&q=80'],
  Korean: ['https://images.unsplash.com/photo-1632778149955-e80f8ceca3e8?auto=format&fit=crop&w=800&q=80'],
  Indian: ['https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80'],
  Vietnamese: ['https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?auto=format&fit=crop&w=800&q=80'],
  Cafe: ['https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=800&q=80'],
  Dessert: ['https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80'],
  Seafood: ['https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80'],
  BBQ: ['https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80'],
  Noodles: ['https://images.unsplash.com/photo-1547928500-300988147b0a?auto=format&fit=crop&w=800&q=80'],
  'Street Food': ['https://images.unsplash.com/photo-1626804475315-9654b4d6673d?auto=format&fit=crop&w=800&q=80'],
  Western: ['https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80'],
  Buffet: ['https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80'],
  Local: ['https://images.unsplash.com/photo-1622979135225-d2ba269cf1ac?auto=format&fit=crop&w=800&q=80'],
};
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1559314809-0d155014e29e?auto=format&fit=crop&w=800&q=80';

const mapCuisineToTags = (cuisineRaw, amenity) => {
  const tags = new Set();
  if (cuisineRaw) {
    const parts = cuisineRaw.toLowerCase().split(/[;,]/);
    parts.forEach((part) => {
      const match = CUISINE_KEYWORD_TO_TAG.find(([re]) => re.test(part));
      if (match) tags.add(match[1]);
    });
  }
  if (tags.size === 0) {
    if (amenity === 'cafe') tags.add('Cafe');
    else if (amenity === 'fast_food') tags.add('Fast Food');
    else tags.add('Local');
  }
  return [...tags].slice(0, 3);
};

const pickImage = (tags) => {
  for (const tag of tags) {
    if (IMAGE_POOL_BY_TAG[tag]) return IMAGE_POOL_BY_TAG[tag][0];
  }
  return DEFAULT_IMAGE;
};

const guessPriceLevel = (tags) => {
  const range = tags['price_range'] || tags['price'];
  if (range === 'cheap' || range === '1') return '฿';
  if (range === 'expensive' || range === '4') return '฿฿฿฿';
  if (range === '3') return '฿฿฿';
  return '฿฿';
};

const buildOverpassQuery = (latitude, longitude, distanceKm) => {
  const dLat = distanceKm / 111;
  const dLng = distanceKm / (111 * Math.cos((latitude * Math.PI) / 180));
  const south = latitude - dLat;
  const north = latitude + dLat;
  const west = longitude - dLng;
  const east = longitude + dLng;
  return `[out:json][timeout:20];(node["amenity"~"restaurant|cafe|fast_food"]["name"](${south},${west},${north},${east}););out body 80;`;
};

const toRestaurant = (element) => {
  const tags = element.tags || {};
  const cuisineTags = mapCuisineToTags(tags.cuisine, tags.amenity);
  const amenityLabel = tags.amenity === 'cafe' ? 'cafe' : tags.amenity === 'fast_food' ? 'fast food spot' : 'restaurant';

  return {
    id: `osm-${element.id}`,
    name: tags.name,
    image: pickImage(cuisineTags),
    description: `A community-mapped ${amenityLabel} on OpenStreetMap${tags.cuisine ? ` (${tags.cuisine.replace(/;/g, ', ')})` : ''}. Photo shown is illustrative, not the actual venue.`,
    price_level: guessPriceLevel(tags),
    tags: cuisineTags,
    latitude: element.lat,
    longitude: element.lon,
    featured_menus: [],
    source: 'osm',
  };
};

// Fetches real nearby food venues from OpenStreetMap via Overpass, trying
// a couple of public mirrors since the free instances can be flaky/rate
// limited. Throws if every mirror fails or returns nothing usable.
export const fetchNearbyRestaurants = async ({ latitude, longitude, distanceKm, limit = 20 }) => {
  const query = buildOverpassQuery(latitude, longitude, distanceKm);
  let lastError = new Error('Could not reach OpenStreetMap.');

  for (const endpoint of OVERPASS_ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`,
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`OpenStreetMap lookup failed (HTTP ${res.status}).`);

      const json = await res.json();
      const elements = (json.elements || []).filter((el) => el.tags && el.tags.name);
      if (elements.length === 0) throw new Error('No named restaurants found on OpenStreetMap for this area.');

      return elements.slice(0, limit).map(toRestaurant);
    } catch (err) {
      lastError = err;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  throw lastError;
};
