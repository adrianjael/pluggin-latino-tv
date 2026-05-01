/**
 * sololatino - Plugin Nuvio
 * Mejorado: formateo de resultados 
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

// ─── Helpers de formateo (estilo LaMovie) ───────────────────────────────────

var normalizeQuality = (quality) => {
  const str = String(quality || "1080p").toLowerCase().replace(/[✅⚡🔥]/g, "").trim();
  const match = str.match(/(\d{3,4})/);
  if (match) return `${match[1]}p`;
  if (str.includes("4k") || str.includes("uhd")) return "2160p";
  if (str.includes("full") || str.includes("fhd")) return "1080p";
  if (str.includes("hd")) return "720p";
  return "1080p";
};

var getServerName = (url) => {
  if (!url) return "SoloLatino";
  if (url.includes("mediafire.com"))  return "Mediafire";
  if (url.includes("goodstream"))     return "GoodStream";
  if (url.includes("streamwish"))     return "StreamWish";
  if (url.includes("voe.sx"))         return "VOE";
  if (url.includes("filemoon"))       return "Filemoon";
  if (url.includes("vimeos.net"))     return "Vimeos";
  return "SoloLatino";
};

var buildStreamEntry = (url, rawQuality, extraHeaders = {}) => {
  const quality    = normalizeQuality(rawQuality);
  const serverName = getServerName(url);
  return {
    name    : "SoloLatino",
    title   : `${quality} · ${serverName}`,
    url,
    quality,
    headers : __spreadValues(
      { "User-Agent": NUVIO_UA, "Referer": "https://player.pelisserieshoy.com/" },
      extraHeaders
    )
  };
};

// ─── Shared: TMDB util ───────────────────────────────────────────────────────

var require_tmdb = __commonJS({
  "src/shared/utils/tmdb.js"(exports2, module2) {
    function getTmdbApiKey() {
      const settings = typeof globalThis !== "undefined" && globalThis.SCRAPER_SETTINGS || {};
      const appKey = settings.tmdb_api_key || settings.tmdbApiKey ||
        (typeof TMDB_API_KEY !== "undefined" ? TMDB_API_KEY : null);
      return appKey || "439c478a771f35c05022f9feabcca01c";
    }
    var NUVIO_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function getImdbId(tmdbId, mediaType) {
      return __async(this, null, function* () {
        try {
          const type = String(mediaType || "").toLowerCase().includes("movie") ? "movie" : "tv";
          const apiKey = getTmdbApiKey();
          const url = `https://api.themoviedb.org/3/${type}/${tmdbId}/external_ids?api_key=${apiKey}`;
          console.log(`[TMDB] Consultando (${type}): ${tmdbId}`);
          const response = yield fetch(url, { headers: { "User-Agent": NUVIO_UA } });
          if (!response.ok) return null;
          const data = yield response.json();
          return data ? data.imdb_id || null : null;
        } catch (e) {
          console.error("[TMDB] Error obteniendo IMDB ID:", e.message);
          return null;
        }
      });
    }
    function getDetails(tmdbId, mediaType) {
      return __async(this, null, function* () {
        try {
          const type = String(mediaType || "").toLowerCase().includes("movie") ? "movie" : "tv";
          const apiKey = getTmdbApiKey();
          const url = `https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${apiKey}&language=es-MX`;
          const response = yield fetch(url, { headers: { "User-Agent": NUVIO_UA } });
          if (!response.ok) return null;
          return yield response.json();
        } catch (e) {
          console.error("[TMDB] Error obteniendo detalles:", e.message);
          return null;
        }
      });
    }
    function getTmdbAliases(tmdbId, mediaType) {
      return __async(this, null, function* () {
        try {
          const type = String(mediaType || "").toLowerCase().includes("movie") ? "movie" : "tv";
          const apiKey = getTmdbApiKey();
          const url = `https://api.themoviedb.org/3/${type}/${tmdbId}/alternative_titles?api_key=${apiKey}`;
          const response = yield fetch(url, { headers: { "User-Agent": NUVIO_UA } });
          if (!response.ok) return [];
          const data = yield response.json();
          if (!data) return [];
          const titles = data.titles || data.results || [];
          return titles.map((t) => t.title || t.name);
        } catch (e) {
          console.error("[TMDB] Error obteniendo alias:", e.message);
          return [];
        }
      });
    }
    module2.exports = { getImdbId, getDetails, getTmdbAliases };
  }
});

// ─── Extractor ───────────────────────────────────────────────────────────────

var require_extractor = __commonJS({
  "src/sololatino/extractor.js"(exports2, module2) {
    var tmdb = require_tmdb();
    var host        = "https://player.pelisserieshoy.com";
    var refererBase = "https://sololatino.net/";
    var NUVIO_UA    = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    function getStreams2(tmdbId, mediaType, season, episode) {
      return __async(this, null, function* () {
        var _a;
        try {
          console.log(`[SoloLatino] v2.9.0: ${mediaType} ID:${tmdbId}`);

          // 1. Obtener IMDB ID
          let imdbId = tmdbId;
          if (!String(tmdbId).startsWith("tt")) {
            imdbId = yield tmdb.getImdbId(tmdbId, mediaType);
          }
          if (!imdbId) return [];

          // 2. Construir slug y URL
          const isMovie = mediaType === "movie";
          const ep      = String(episode || 1).padStart(2, "0");
          const slug    = isMovie ? imdbId : `${imdbId}-${season || 1}x${ep}`;
          const oWeb    = `${host}/f/${slug}`;
          const headers = { "User-Agent": NUVIO_UA, "Referer": refererBase };

          // 3. Obtener HTML y token
          const response = yield fetch(oWeb, { headers });
          if (!response.ok) return [];
          const html = yield response.text();

          const setCookieHeaders = response.headers.get("set-cookie");
          let cookie = "";
          if (setCookieHeaders) {
            cookie = setCookieHeaders.split(",")
              .map((c) => c.split(";")[0].trim())
              .join("; ");
          }

          const tokenMatch = html.match(
            /(?:let\s+token|const\s+_t|tok|_t|token)\s*.*['"]([a-f0-9]{32})['"]/i
          );
          const token = tokenMatch ? tokenMatch[1] : "";
          if (!token) return [];

          // 4. Headers comunes POST
          const commonHeaders = __spreadProps(__spreadValues({}, headers), {
            "Content-Type"    : "application/x-www-form-urlencoded; charset=UTF-8",
            "Referer"         : oWeb,
            "X-Requested-With": "XMLHttpRequest"
          });
          if (cookie) commonHeaders["Cookie"] = cookie;

          // 5. Click + lista de servidores
          yield fetch(`${host}/s.php`, {
            method: "POST", headers: commonHeaders, body: `a=click&tok=${token}`
          }).catch(() => {});

          const listRes  = yield fetch(`${host}/s.php`, {
            method: "POST", headers: commonHeaders, body: `a=1&tok=${token}`
          });
          const listData = yield listRes.json();
          const latServers = ((_a = listData.langs_s) == null ? void 0 : _a.LAT) || listData.s || [];

          // 6. Resolver cada servidor
          const streams = [];
          for (const srv of latServers) {
            try {
              const sResponse = yield fetch(`${host}/s.php`, {
                method : "POST",
                headers: __spreadProps(__spreadValues({}, commonHeaders), { "Origin": host }),
                body   : `a=2&v=${srv[1]}&tok=${token}`
              });
              const sData = yield sResponse.json();
              if (!sData || !sData.u) continue;

              let videoUrl = sData.u;

              // Resolver /api/source/ (servidor propio)
              if (videoUrl.includes("/api/source/")) {
                const domain = new URL(videoUrl).hostname;
                const apiRes = yield fetch(videoUrl, {
                  method : "POST",
                  headers: __spreadProps(__spreadValues({}, {
                    "User-Agent": NUVIO_UA,
                    "Referer"   : oWeb,
                    "origin"    : host
                  }), { "Content-Type": "application/x-www-form-urlencoded" }),
                  body: `r=https%3A%2F%2Fre.sololatino.net%2F&d=${domain}`
                });
                const apiData = yield apiRes.json();
                if (apiData.success && apiData.data && apiData.data.length > 0) {
                  videoUrl = apiData.data[apiData.data.length - 1].file;
                }
              }

              if (!videoUrl.startsWith("http")) videoUrl = host + videoUrl;

              // Detectar Mediafire (HEAD follow)
              try {
                const masterHeaders = {
                  "User-Agent": NUVIO_UA,
                  "Referer"   : oWeb,
                  "origin"    : host,
                  ...(cookie ? { "Cookie": cookie } : {})
                };
                const finalRes = yield fetch(videoUrl, {
                  method: "HEAD", headers: masterHeaders, redirect: "follow"
                });
                const finalUrl = finalRes.url || videoUrl;

                // ── FORMATEO MEJORADO ──────────────────────────────────
                // Calidad desde el servidor (srv[2]) o fallback 1080p
                const rawQuality = srv[2] || "1080p";
                streams.push(buildStreamEntry(finalUrl, rawQuality));
                // ──────────────────────────────────────────────────────

              } catch (e) {
                // Si HEAD falla, igual añadimos con la URL que tenemos
                streams.push(buildStreamEntry(videoUrl, srv[2] || "1080p"));
              }

            } catch (e) {
              console.log(`[SoloLatino] Error servidor: ${e.message}`);
            }
          }

          console.log(`[SoloLatino] ✓ ${streams.length} streams encontrados`);
          return streams;

        } catch (error) {
          console.error(`[SoloLatino] Error general: ${error.message}`);
          return [];
        }
      });
    }

    module2.exports = { getStreams: getStreams2 };
  }
});

// ─── Index ───────────────────────────────────────────────────────────────────

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
