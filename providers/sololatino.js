/**
 * sololatino - Plugin Nuvio
 * Generado: 2026-04-27T17:57:07.047Z
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
    var UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function getStreams2(tmdbId, mediaType, season, episode) {
      return __async(this, null, function* () {
        var _a;
        try {
          console.log(`[SoloLatino] Sync v2.6.1: ${mediaType} ID:${tmdbId}`);
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
          const headers = { "User-Agent": UA, "Referer": refererBase };
          const response = yield fetch(playerUrl, { headers });
          if (!response.ok)
            return [];
          const html = yield response.text();
          const setCookieHeaders = response.headers.get("set-cookie");
          let cookie = "";
          if (setCookieHeaders) {
            cookie = setCookieHeaders.split(",").map((c) => c.split(";")[0].trim()).join("; ");
          }
          const tokenMatch = html.match(/(?:let\s+token|const\s+_t|tok|_t|token)\s*.*['"]([a-f0-9]{32})['"]/i);
          const token = tokenMatch ? tokenMatch[1] : "";
          if (!token)
            return [];
          const commonHeaders = __spreadProps(__spreadValues({}, headers), {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "Referer": playerUrl,
            "X-Requested-With": "XMLHttpRequest"
          });
          if (cookie)
            commonHeaders["Cookie"] = cookie;
          yield fetch(`${host}/s.php`, { method: "POST", headers: commonHeaders, body: `a=click&tok=${token}` }).catch(() => {
          });
          const listRes = yield fetch(`${host}/s.php`, { method: "POST", headers: commonHeaders, body: `a=1&tok=${token}` });
          const listData = yield listRes.json();
          const latServers = ((_a = listData.langs_s) == null ? void 0 : _a.LAT) || listData.s || [];
          const streams = [];
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
              let videoUrl = sData.u;
              let finalHeaders = { "User-Agent": UA, "Referer": host + "/" };
              if (sData.sig) {
                videoUrl = `${host}/p.php?url=${encodeURIComponent(videoUrl)}&sig=${sData.sig}`;
                if (cookie)
                  finalHeaders["Cookie"] = cookie;
              } else if (videoUrl.startsWith("/")) {
                videoUrl = host + videoUrl;
              }
              if (!videoUrl.includes(".m3u8") && !videoUrl.includes(".mp4"))
                videoUrl += "#.mp4";
              streams.push({
                name: `SoloLatino - ${srv[0].replace(/🎬|🚀|✅/gu, "").trim()}`,
                url: videoUrl,
                quality: "1080p \u2705",
                language: "Latino",
                headers: finalHeaders
              });
            } catch (e) {
            }
          }
          return streams;
        } catch (error) {
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
