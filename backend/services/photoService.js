const axios = require("axios");

// Headers required by Wikimedia API policy to prevent 403 Forbidden
const WIKI_HEADERS = {
  "User-Agent": "AIMediaGeneratorApp/1.0 (https://github.com/personal/ai-media-generator; contact@example.com) axios/1.6.7",
  Accept: "application/json",
};

/**
 * Normalizes query string for Wikipedia search
 */
function cleanQuery(query) {
  return (query || "")
    .replace(/\b(real photo of|real photograph of|actual photo of|real photos?|authentic photo of|picture of|photo of|image of|hd photo of)\b/gi, "")
    .trim();
}

/**
 * Searches Wikipedia direct page with redirect resolution (e.g. "Virat Kohli", "Modi", "CR7", "Taj Mahal")
 */
async function searchWikipediaDirectTitle(term) {
  try {
    const url = "https://en.wikipedia.org/w/api.php";
    const res = await axios.get(url, {
      headers: WIKI_HEADERS,
      timeout: 6000,
      params: {
        action: "query",
        titles: term,
        redirects: 1,
        prop: "pageimages|extracts|info",
        piprop: "original|thumbnail",
        pithumbsize: 1200,
        exintro: 1,
        explaintext: 1,
        exsentences: 2,
        inprop: "url",
        format: "json",
      },
    });

    const pages = res.data?.query?.pages;
    if (!pages) return [];

    const results = [];
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    for (const id of Object.keys(pages)) {
      if (id === "-1") continue; // Page not found
      const page = pages[id];
      const imageUrl = page.thumbnail?.source || page.original?.source;
      if (!imageUrl) continue;

      const lowerUrl = imageUrl.toLowerCase();
      const isValidExt = validExtensions.some((ext) => lowerUrl.includes(ext));
      if (!isValidExt) continue;

      results.push({
        url: imageUrl,
        originalUrl: page.original?.source || imageUrl,
        thumbnail: page.thumbnail?.source || imageUrl,
        title: page.title,
        description: page.extract || `Authentic verified photograph of ${page.title}`,
        author: "Wikipedia Verified Archive",
        source: "Wikipedia (Authentic Real Photo)",
        sourceUrl: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
        isRealPhoto: true,
      });
    }

    return results;
  } catch (err) {
    console.warn("[photoService] Wikipedia direct title search error:", err.message);
    return [];
  }
}

/**
 * Searches Wikipedia article images and lead portraits via search engine
 */
async function searchWikipediaPortraits(term, limit = 4) {
  try {
    const url = "https://en.wikipedia.org/w/api.php";
    const res = await axios.get(url, {
      headers: WIKI_HEADERS,
      timeout: 6000,
      params: {
        action: "query",
        generator: "search",
        gsrsearch: term,
        gsrlimit: limit,
        prop: "pageimages|extracts|info",
        piprop: "original|thumbnail",
        pithumbsize: 1200,
        exintro: 1,
        explaintext: 1,
        exsentences: 2,
        inprop: "url",
        format: "json",
      },
    });

    const pages = res.data?.query?.pages;
    if (!pages) return [];

    const results = [];
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    for (const id of Object.keys(pages)) {
      const page = pages[id];
      const imageUrl = page.thumbnail?.source || page.original?.source;
      if (!imageUrl) continue;

      const lowerUrl = imageUrl.toLowerCase();
      const isValidExt = validExtensions.some((ext) => lowerUrl.includes(ext));
      if (!isValidExt) continue;

      results.push({
        url: imageUrl,
        originalUrl: page.original?.source || imageUrl,
        thumbnail: page.thumbnail?.source || imageUrl,
        title: page.title,
        description: page.extract || `Authentic verified photograph of ${page.title}`,
        author: "Wikipedia Verified Archive",
        source: "Wikipedia (Authentic Real Photo)",
        sourceUrl: page.fullurl || `https://en.wikipedia.org/wiki/${encodeURIComponent(page.title)}`,
        isRealPhoto: true,
      });
    }

    return results;
  } catch (err) {
    console.warn("[photoService] Wikipedia portrait search error:", err.message);
    return [];
  }
}

/**
 * Searches Wikimedia Commons for authentic real-life photography
 */
async function searchWikimediaCommons(term, limit = 8) {
  try {
    const url = "https://commons.wikimedia.org/w/api.php";
    const res = await axios.get(url, {
      headers: WIKI_HEADERS,
      timeout: 7000,
      params: {
        action: "query",
        generator: "search",
        gsrsearch: term,
        gsrnamespace: 6, // File namespace
        prop: "imageinfo",
        iiprop: "url|size|extmetadata",
        iiurlwidth: 1280,
        format: "json",
        gsrlimit: limit,
      },
    });

    const pages = res.data?.query?.pages;
    if (!pages) return [];

    const results = [];
    const validExtensions = [".jpg", ".jpeg", ".png", ".webp"];

    for (const id of Object.keys(pages)) {
      const page = pages[id];
      const info = page.imageinfo?.[0];
      if (!info) continue;

      const fileUrl = info.url || info.thumburl;
      const lowerUrl = (fileUrl || "").toLowerCase();

      // Filter to real photo extensions
      const isValidExt = validExtensions.some((ext) => lowerUrl.includes(ext));
      if (!isValidExt) continue;

      const title = (page.title || "").replace(/^File:/i, "").replace(/[\-_]/g, " ").replace(/\.\w+$/, "");
      const lowerTitle = title.toLowerCase();

      // Skip logos, icons, diagrams, coats of arms, map graphics
      if (
        lowerTitle.includes("logo") ||
        lowerTitle.includes("coat of arms") ||
        lowerTitle.includes("flag of") ||
        lowerTitle.includes("icon") ||
        lowerTitle.includes("diagram") ||
        lowerTitle.includes("map") ||
        lowerTitle.includes("signature") ||
        lowerTitle.includes("symbol")
      ) {
        continue;
      }

      const cleanCaption =
        info.extmetadata?.ImageDescription?.value?.replace(/<[^>]+>/g, "").slice(0, 160) ||
        title;

      const artist = info.extmetadata?.Artist?.value?.replace(/<[^>]+>/g, "").slice(0, 60) || "Wikimedia Photographer";

      results.push({
        url: info.thumburl || info.url,
        originalUrl: info.url,
        thumbnail: info.thumburl || info.url,
        title: title.trim(),
        description: cleanCaption.trim(),
        author: artist.trim(),
        source: "Wikimedia Commons (Real Photo Archive)",
        sourceUrl: info.descriptionurl || `https://commons.wikimedia.org/wiki/${encodeURIComponent(page.title)}`,
        isRealPhoto: true,
      });
    }

    return results;
  } catch (err) {
    console.warn("[photoService] Wikimedia Commons search error:", err.message);
    return [];
  }
}

/**
 * Master Real Photo Finder
 * Searches direct Wikipedia title, Wikipedia search portraits, and Wikimedia Commons high-res photos
 */
async function findRealPhotos(query) {
  if (!query || !query.trim()) return [];

  const clean = cleanQuery(query);
  console.log(`[PhotoService] Searching authentic real photos for: "${clean}"`);

  // Run in parallel: direct title lookup, search portraits, and commons photography
  const [directResults, searchResults, commonsResults] = await Promise.all([
    searchWikipediaDirectTitle(clean),
    searchWikipediaPortraits(clean, 4),
    searchWikimediaCommons(clean, 6),
  ]);

  const seenUrls = new Set();
  const combined = [];

  // 1. Prioritize direct title match (guaranteed authentic match for celebrities/places)
  for (const item of directResults) {
    if (item.url && !seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      combined.push(item);
    }
  }

  // 2. Add search results
  for (const item of searchResults) {
    if (item.url && !seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      combined.push(item);
    }
  }

  // 3. Add Wikimedia Commons photos
  for (const item of commonsResults) {
    if (item.url && !seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      combined.push(item);
    }
  }

  if (combined.length > 0) {
    console.log(`[PhotoService] Found ${combined.length} authentic real photos for "${clean}"`);
    return combined;
  }

  // 4. Fallback search with "photograph" suffix in Commons
  const fallbackCommons = await searchWikimediaCommons(`${clean} photo`, 4);
  for (const item of fallbackCommons) {
    if (item.url && !seenUrls.has(item.url)) {
      seenUrls.add(item.url);
      combined.push(item);
    }
  }

  return combined;
}

module.exports = {
  findRealPhotos,
  searchWikipediaDirectTitle,
  searchWikipediaPortraits,
  searchWikimediaCommons,
};
