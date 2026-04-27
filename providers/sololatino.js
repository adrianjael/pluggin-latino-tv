/**
 * sololatino - Plugin Nuvio
 * Generado: 2026-04-27T17:23:44.348Z
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
    function unpackVidHide(script) {
      try {
        const match = script.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]*?)'\.split\('\|'\)/);
        if (!match)
          return null;
        let [full, p, a, c, k] = match;
        a = parseInt(a);
        c = parseInt(c);
        k = k.split("|");
        const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
        const decode = (l, s) => {
          let res = "";
          while (l > 0) {
            res = chars[l % s] + res;
            l = Math.floor(l / s);
          }
          return res || "0";
        };
        const unpacked = p.replace(/\b\w+\b/g, (l) => {
          const s = parseInt(l, 36);
          return s < k.length && k[s] ? k[s] : decode(s, a);
        });
        return unpacked;
      } catch (e) {
        return null;
      }
    }
    function getStreams2(tmdbId, mediaType, season, episode) {
      return __async(this, null, function* () {
        var _a;
        try {
          console.log(`[SoloLatino] B\xFAsqueda v2.5.2: ${mediaType} ID:${tmdbId}`);
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
          const response = yield fetch(playerUrl, { headers: { "User-Agent": UA, "Referer": refererBase } });
          if (!response.ok)
            return [];
          const html = yield response.text();
          const setCookieHeader = response.headers.get("set-cookie");
          const cookie = setCookieHeader ? setCookieHeader.split(",").map((c) => c.split(";")[0].trim()).join("; ") : "";
          const tokenMatch = html.match(/(?:let\s+token|const\s+_t|tok|_t|token)\s*.*['"]([a-f0-9]{32})['"]/i);
          const token = tokenMatch ? tokenMatch[1] : "";
          if (!token)
            return [];
          const commonHeaders = {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "User-Agent": UA,
            "Referer": playerUrl,
            "X-Requested-With": "XMLHttpRequest"
          };
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
              let finalUrl = sData.u;
              let resultHeaders = {
                "User-Agent": UA,
                "Referer": `${host}/p.php`,
                // Referer de legado para el proxy
                "Origin": host,
                "Cookie": cookie
              };
              const isVidHide = finalUrl.includes("masukestin.com") || finalUrl.includes("minochinos.com") || finalUrl.includes("vidhide.com");
              const isM3U8 = finalUrl.includes(".m3u8");
              if (isVidHide && !isM3U8) {
                const embedRes = yield fetch(finalUrl, { headers: { "User-Agent": UA, "Referer": host } });
                if (embedRes.ok) {
                  const embedHtml = yield embedRes.text();
                  const packedMatch = embedHtml.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
                  if (packedMatch) {
                    const unpacked = unpackVidHide(packedMatch[0]);
                    const hlsMatch = unpacked ? unpacked.match(/"hls[24]"\s*:\s*"([^"]+)"/) : null;
                    if (hlsMatch) {
                      finalUrl = hlsMatch[1];
                      resultHeaders.Referer = new URL(sData.u).origin + "/";
                    }
                  }
                }
              } else if (sData.sig) {
                finalUrl = `${host}/p.php?url=${encodeURIComponent(finalUrl)}&sig=${sData.sig}`;
              } else if (finalUrl.startsWith("/")) {
                finalUrl = host + finalUrl;
              }
              if (!finalUrl.includes(".m3u8") && !finalUrl.includes(".mp4"))
                finalUrl += "#.mp4";
              streams.push({
                name: `SoloLatino - ${srv[0].replace(/🎬|🚀|✅/gu, "").trim()}`,
                url: finalUrl,
                quality: "1080p \u2705",
                language: "Latino",
                headers: resultHeaders
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
