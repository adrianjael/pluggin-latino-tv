/**
 * sololatino - Plugin Nuvio
 * Generado: 2026-04-27T16:52:49.315Z
 */
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// src/shared/utils/tmdb.js
var require_tmdb = __commonJS({
  "src/shared/utils/tmdb.js"(exports2, module2) {
    function getTmdbApiKey() {
      const settings = typeof globalThis !== "undefined" && globalThis.SCRAPER_SETTINGS || {};
      const appKey = settings.tmdb_api_key || settings.tmdbApiKey || (typeof TMDB_API_KEY !== "undefined" ? TMDB_API_KEY : null);
      return appKey || "439c478a771f35c05022f9feabcca01c";
    }
    function getImdbId(tmdbId, mediaType) {
      return __async(this, null, function* () {
        try {
          const type = String(mediaType || "").toLowerCase().includes("movie") ? "movie" : "tv";
          const apiKey = getTmdbApiKey();
          const url = `https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${apiKey}`;
          console.log(`[TMDB] Consultando (${type}): ${tmdbId} usando API Key: ${apiKey.substring(0, 4)}...`);
          const response = yield fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
            }
          });
          const data = yield response.json();
          return data.imdb_id || null;
        } catch (e) {
          console.error("[TMDB] Error obteniendo IMDB ID:", e.message);
          return null;
        }
      });
    }
    module2.exports = { getImdbId };
  }
});

// src/sololatino/extractor.js
var require_extractor = __commonJS({
  "src/sololatino/extractor.js"(exports2, module2) {
    var tmdb = require_tmdb();
    var host = "https://player.pelisserieshoy.com";
    var refererBase = "https://sololatino.net/";
    function getStreams2(tmdbId, mediaType, season, episode) {
      return __async(this, null, function* () {
        try {
          console.log(`[SoloLatino] B\xFAsqueda v2.4.5 (Legacy Mode): ${mediaType} ID:${tmdbId}`);
          let imdbId = tmdbId;
          if (!String(tmdbId).startsWith("tt")) {
            imdbId = yield tmdb.getImdbId(tmdbId, mediaType);
          }
          if (!imdbId)
            return [];
          const isMovie = mediaType === "movie";
          const ep = String(episode || 1).padStart(2, "0");
          const slug = isMovie ? imdbId : `${imdbId}-${season || 1}x${ep}`;
          const playerUrl = `${host}/f/${slug}`;
          const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36";
          const stealthHeaders = {
            "User-Agent": UA,
            "Referer": refererBase,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8",
            "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
            "sec-ch-ua": '"Chromium";v="137", "Not-A.Brand";v="24", "Google Chrome";v="137"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "Sec-Fetch-Dest": "document",
            "Sec-Fetch-Mode": "navigate",
            "Sec-Fetch-Site": "none",
            "Upgrade-Insecure-Requests": "1"
          };
          const response = yield fetch(playerUrl, { headers: stealthHeaders });
          if (!response.ok)
            return [];
          const html = yield response.text();
          const setCookie = response.headers.get("set-cookie") || "";
          const cookie = setCookie.split(";")[0];
          const tokenMatch = html.match(/(?:let\s+token|const\s+_t|tok|_t|token)\s*.*['"]([a-f0-9]{32})['"]/i);
          const token = tokenMatch ? tokenMatch[1] : "";
          if (!token)
            return [];
          const commonHeaders = {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": UA,
            "Referer": playerUrl,
            "X-Requested-With": "XMLHttpRequest",
            "sec-ch-ua": stealthHeaders["sec-ch-ua"],
            "sec-ch-ua-platform": '"Windows"'
          };
          if (cookie)
            commonHeaders["Cookie"] = cookie;
          const streams = [];
          yield fetch(`${host}/s.php`, {
            method: "POST",
            headers: commonHeaders,
            body: `a=click&tok=${token}`
          }).catch(() => {
          });
          yield new Promise((r) => setTimeout(r, 1200));
          const listRes = yield fetch(`${host}/s.php`, {
            method: "POST",
            headers: commonHeaders,
            body: `a=1&tok=${token}`
          });
          const listData = yield listRes.json();
          if (!listData || !listData.langs_s)
            return [];
          const latServers = listData.langs_s.LAT || listData.s || [];
          for (const srv of latServers) {
            try {
              const sResponse = yield fetch(`${host}/s.php`, {
                method: "POST",
                headers: __spreadProps(__spreadValues({}, commonHeaders), { "Origin": host }),
                body: `a=2&v=${srv[1]}&tok=${token}`
              });
              const sData = yield sResponse.json();
              if (!sData || !sData.u)
                continue;
              let finalUrl = sData.u;
              if (sData.sig) {
                finalUrl = `${host}/p.php?url=${encodeURIComponent(sData.u)}&sig=${sData.sig}`;
              } else if (finalUrl.startsWith("/")) {
                finalUrl = host + finalUrl;
              }
              if (!finalUrl.includes(".m3u8") && !finalUrl.includes(".mp4")) {
                finalUrl += "#.mp4";
              }
              const formatServer = (name) => {
                if (!name)
                  return "Unknown";
                let cleanName = name.replace(/[\u{1F300}-\u{1F9FF}]|[\u{2700}-\u{27BF}]|[\u{E000}-\u{F8FF}]|\u{D83C}[\u{DC00}-\u{DFFF}]|\u{D83D}[\u{DC00}-\u{DFFF}]|[\u{2011}-\u{26FF}]|\u{D83E}[\u{DC00}-\u{DFFF}]/gu, "").trim();
                if (cleanName.includes("Player+"))
                  return "Mediafire Directo \u{1F680}";
                return cleanName;
              };
              streams.push({
                name: `SoloLatino - ${formatServer(srv[0])}`,
                url: finalUrl,
                quality: "1080p \u2705",
                language: "Latino",
                headers: {
                  "User-Agent": UA,
                  "Referer": playerUrl,
                  // Referer específico de la película
                  "Origin": host,
                  "Accept": "*/*",
                  "Cookie": cookie
                }
              });
            } catch (e) {
            }
          }
          return streams;
        } catch (error) {
          console.error("[SoloLatino] Error:", error);
          return [];
        }
      });
    }
    module2.exports = { getStreams: getStreams2 };
  }
});

// src/sololatino/index.js
var extractor = require_extractor();
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      console.log(`[SoloLatino] Buscando streams para ID: ${tmdbId}`);
      const streams = yield extractor.getStreams(tmdbId, mediaType, season, episode);
      return streams;
    } catch (error) {
      console.error(`[SoloLatino Index Error]:`, error.message);
      return [];
    }
  });
}
module.exports = { getStreams };
