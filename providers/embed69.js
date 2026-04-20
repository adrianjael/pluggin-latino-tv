/**
 * embed69 - Plugin Nuvio
 * Generado: 2026-04-20T14:53:30.577Z
 */
var __defProp = Object.defineProperty;
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

// src/embed69/http.js
var require_http = __commonJS({
  "src/embed69/http.js"(exports2, module2) {
    var http = {
      get(_0) {
        return __async(this, arguments, function* (url, headers = {}) {
          try {
            const response = yield fetch(url, {
              method: "GET",
              headers: __spreadValues({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
              }, headers)
            });
            return yield response.text();
          } catch (error) {
            console.error(`[HTTP GET Error] ${url}:`, error.message);
            throw error;
          }
        });
      },
      post(_0, _1) {
        return __async(this, arguments, function* (url, data, headers = {}) {
          try {
            const response = yield fetch(url, {
              method: "POST",
              headers: __spreadValues({
                "Content-Type": "application/x-www-form-urlencoded"
              }, headers),
              body: typeof data === "string" ? data : JSON.stringify(data)
            });
            return yield response.text();
          } catch (error) {
            console.error(`[HTTP POST Error] ${url}:`, error.message);
            throw error;
          }
        });
      }
    };
    module2.exports = http;
  }
});

// src/shared/resolvers/vidhide.js
var require_vidhide = __commonJS({
  "src/shared/resolvers/vidhide.js"(exports2, module2) {
    var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function resolveVidhide(url) {
      return __async(this, null, function* () {
        var _a;
        try {
          console.log(`[Resolvers] Resolviendo VidHide: ${url}`);
          const response = yield fetch(url, {
            headers: {
              "User-Agent": USER_AGENT,
              "Referer": "https://embed69.org/"
            }
          });
          const html = yield response.text();
          const evalMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
          if (!evalMatch) {
            console.log("[Resolvers] No se encontr\xF3 el empaquetado (eval) en VidHide.");
            return null;
          }
          const unpack = (code) => {
            const match = code.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]*?)'\.split\('\|'\)/);
            if (!match)
              return null;
            let [, p, a, c, k] = match;
            a = parseInt(a);
            c = parseInt(c);
            let kArr = k.split("|");
            const intToChar = (v, radix) => {
              const chars = "0123456789abcdefghijklmnopqrstuvwxyz";
              let res = "";
              while (v > 0) {
                res = chars[v % radix] + res;
                v = Math.floor(v / radix);
              }
              return res || "0";
            };
            return p.replace(/\b\w+\b/g, (e) => {
              const index = parseInt(e, 36);
              return index < kArr.length && kArr[index] ? kArr[index] : intToChar(index, a);
            });
          };
          const unpacked = unpack(evalMatch[0]);
          if (!unpacked)
            return null;
          const hls4 = unpacked.match(/"hls4"\s*:\s*"([^"]+)"/);
          const hls2 = unpacked.match(/"hls2"\s*:\s*"([^"]+)"/);
          const link = (_a = hls4 || hls2) == null ? void 0 : _a[1];
          if (!link)
            return null;
          const originMatch = url.match(/^(https?:\/\/[^\/]+)/);
          const origin = originMatch ? originMatch[1] : "";
          let finalUrl = link.startsWith("http") ? link : `${origin}${link}`;
          return {
            url: finalUrl,
            quality: "1080p",
            headers: { "Referer": `${origin}/` }
          };
        } catch (e) {
          console.error(`[Resolvers] Error en VidHide: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = resolveVidhide;
  }
});

// src/shared/resolvers/streamwish.js
var require_streamwish = __commonJS({
  "src/shared/resolvers/streamwish.js"(exports2, module2) {
    var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function resolveStreamwish(url) {
      return __async(this, null, function* () {
        try {
          console.log(`[Resolvers] Resolviendo Streamwish: ${url}`);
          let fetchUrl = url.replace("hglink.to", "vibuxer.com");
          const originMatch = fetchUrl.match(/^(https?:\/\/[^\/]+)/);
          const origin = originMatch ? originMatch[1] : "";
          const response = yield fetch(fetchUrl, {
            headers: { "User-Agent": USER_AGENT, "Referer": "https://embed69.org/" }
          });
          const html = yield response.text();
          const directFile = html.match(/file\s*:\s*["']([^"']+)["']/i);
          if (directFile) {
            let m3u8Url = directFile[1].startsWith("/") ? origin + directFile[1] : directFile[1];
            if (m3u8Url.includes("vibuxer.com/stream/")) {
              try {
                const redirectRes = yield fetch(m3u8Url, {
                  method: "GET",
                  headers: { "User-Agent": USER_AGENT, "Referer": origin + "/" }
                });
                if (redirectRes.url && redirectRes.url.includes(".m3u8")) {
                  m3u8Url = redirectRes.url;
                }
              } catch (rErr) {
              }
            }
            return { url: m3u8Url, quality: "Auto", headers: { "Referer": origin + "/" } };
          }
          const evalPacked = html.match(/eval\(function\(p,a,c,k,e,[a-z]\)\{[^}]+\}\s*\('([\s\S]+?)',\s*(\d+),\s*(\d+),\s*'([\s\S]+?)'\.split\('\|'\)/);
          if (evalPacked) {
            const m3u8Regex = /["']([^"']{30,}\.m3u8[^"']*)['"]/i;
            const directMatch = html.match(m3u8Regex);
            if (directMatch)
              return { url: directMatch[1], quality: "Auto", headers: { "Referer": origin + "/" } };
          }
          const fallback = html.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
          if (fallback) {
            return { url: fallback[0], quality: "Auto", headers: { "Referer": origin + "/" } };
          }
          return null;
        } catch (e) {
          console.error(`[Resolvers] Error en Streamwish: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = resolveStreamwish;
  }
});

// src/shared/utils/base64.js
var require_base64 = __commonJS({
  "src/shared/utils/base64.js"(exports2, module2) {
    function base64Decode(str) {
      if (typeof str !== "string")
        return "";
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      let output = "";
      str = str.replace(/=+$/, "");
      if (str.length % 4 === 1)
        return "";
      for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
      }
      try {
        return decodeURIComponent(escape(output));
      } catch (e) {
        return output;
      }
    }
    module2.exports = { base64Decode };
  }
});

// src/shared/resolvers/voe.js
var require_voe = __commonJS({
  "src/shared/resolvers/voe.js"(exports2, module2) {
    var { base64Decode } = require_base64();
    var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function resolveVoe(url) {
      return __async(this, null, function* () {
        try {
          console.log(`[Resolvers] Resolviendo VOE: ${url}`);
          let response = yield fetch(url, {
            headers: { "User-Agent": USER_AGENT, "Referer": url }
          });
          let html = yield response.text();
          const hlsMatch = /(?:mp4|hls)["']\s*:\s*["']([^"']+)["']/gi;
          let match;
          const links = [];
          while ((match = hlsMatch.exec(html)) !== null) {
            links.push(match[1]);
          }
          for (let l of links) {
            if (!l)
              continue;
            let decodedUrl = l;
            if (decodedUrl.startsWith("aHR0")) {
              try {
                decodedUrl = base64Decode(decodedUrl);
              } catch (e) {
              }
            }
            if (decodedUrl.includes(".m3u8") || decodedUrl.includes(".mp4")) {
              return { url: decodedUrl, quality: "Auto", headers: { "Referer": url } };
            }
          }
          return null;
        } catch (e) {
          console.error(`[Resolvers] Error en VOE: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = resolveVoe;
  }
});

// src/shared/resolvers/index.js
var require_resolvers = __commonJS({
  "src/shared/resolvers/index.js"(exports2, module2) {
    var resolveVidhide = require_vidhide();
    var resolveStreamwish = require_streamwish();
    var resolveVoe = require_voe();
    var registry = {
      vidhide: resolveVidhide,
      streamwish: resolveStreamwish,
      filemoon: resolveStreamwish,
      // Mismo método que streamwish inicialmente si falla su AES
      voe: resolveVoe
    };
    function resolve(servername, url) {
      return __async(this, null, function* () {
        const name = String(servername).toLowerCase().trim();
        if (registry[name]) {
          return yield registry[name](url);
        }
        return null;
      });
    }
    module2.exports = { resolve };
  }
});

// src/shared/utils/tmdb.js
var require_tmdb = __commonJS({
  "src/shared/utils/tmdb.js"(exports2, module2) {
    function getImdbId(tmdbId, mediaType) {
      return __async(this, null, function* () {
        try {
          const apiKey = "439c478a771f35c05022f9feabcca01c";
          const url = `https://api.themoviedb.org/3/${mediaType}/${tmdbId}/external_ids?api_key=${apiKey}`;
          const response = yield fetch(url, {
            headers: {
              "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
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

// src/embed69/extractor.js
var require_extractor = __commonJS({
  "src/embed69/extractor.js"(exports2, module2) {
    var http = require_http();
    var resolvers = require_resolvers();
    var tmdb = require_tmdb();
    var { base64Decode } = require_base64();
    function decodeJwtPayload(token) {
      try {
        const parts = token.split(".");
        if (parts.length !== 3)
          return null;
        const base64Url = parts[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = base64Decode(base64);
        return JSON.parse(jsonPayload);
      } catch (e) {
        console.error("Error decodificando JWT:", e.message);
        return null;
      }
    }
    var extractor2 = {
      getLinks(id, type, season, episode) {
        return __async(this, null, function* () {
          const imdbId = yield tmdb.getImdbId(id, type);
          if (!imdbId) {
            console.log(`[Embed69] No se pudo encontrar el IMDB ID para TMDB ID: ${id}`);
            return [];
          }
          let urlId = imdbId;
          if (type === "tv" && season && episode) {
            const ep = String(episode).padStart(2, "0");
            urlId = `${imdbId}-${season}x${ep}`;
          }
          const url = `https://embed69.org/f/${urlId}`;
          console.log(`[Embed69] Navegando a: ${url}`);
          try {
            const response = yield http.get(url);
            const html = typeof response === "object" ? JSON.stringify(response) : String(response);
            const match = html.match(/let\s+dataLink\s*=\s*(\[.*?\]);/);
            if (!match) {
              console.log("[Embed69] No se encontr\xF3 'dataLink' en el HTML. \xBFQuiz\xE1s no existe el ID o hay un nuevo formato?");
              return [];
            }
            const dataLinkJson = JSON.parse(match[1]);
            const latData = dataLinkJson.find((item) => item.video_language === "LAT");
            if (!latData || !Array.isArray(latData.sortedEmbeds)) {
              console.log("[Embed69] No se encontraron servidores en idioma LAT.");
              return [];
            }
            const streamPromises = latData.sortedEmbeds.map((embed) => __async(this, null, function* () {
              if (!embed.link)
                return;
              const payload = decodeJwtPayload(embed.link);
              if (payload && payload.link) {
                const embedUrl = payload.link;
                const resolved = yield resolvers.resolve(embed.servername, embedUrl);
                if (resolved && resolved.url) {
                  return {
                    name: `Embed69 (${embed.servername})`,
                    title: `Latino - ${embed.servername.toUpperCase()}`,
                    url: resolved.url,
                    // Este url YA será mp4 o m3u8
                    quality: resolved.quality || "Auto",
                    headers: resolved.headers || {}
                  };
                }
              }
            }));
            const results = yield Promise.all(streamPromises);
            const streams = results.filter((s) => s !== void 0 && s !== null);
            return streams;
          } catch (error) {
            console.error(`[Embed69] Error extrayendo streams:`, error.message);
            return [];
          }
        });
      }
    };
    module2.exports = extractor2;
  }
});

// src/embed69/index.js
var extractor = require_extractor();
function getStreams(tmdbId, mediaType, season, episode) {
  return __async(this, null, function* () {
    try {
      console.log(`[Latino TV] Iniciando b\xFAsqueda para TMDB: ${tmdbId}`);
      const streams = yield extractor.getLinks(tmdbId, mediaType, season, episode);
      return streams;
    } catch (error) {
      console.error(`[Latino TV Error]:`, error.message);
      return [];
    }
  });
}
module.exports = { getStreams };
