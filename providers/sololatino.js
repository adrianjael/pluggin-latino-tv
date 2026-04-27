/**
 * sololatino - Plugin Nuvio
 * Generado: 2026-04-27T15:10:11.563Z
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

// src/shared/utils/unpacker.js
var require_unpacker = __commonJS({
  "src/shared/utils/unpacker.js"(exports2, module2) {
    function unpack(code) {
      try {
        const match = code.match(/eval\(function\(p,a,c,k,e,[rd]\)\{.*?\}\s*\('([\s\S]*?)',\s*(\d+),\s*(\d+),\s*'([\s\S]*?)'\.split\('\|'\)/);
        if (!match)
          return code;
        let [, p, a, c, k] = match;
        a = parseInt(a);
        c = parseInt(c);
        let kArr = k.split("|");
        const intToChar = (v, radix) => {
          const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
          let res = "";
          while (v > 0) {
            res = chars[v % radix] + res;
            v = Math.floor(v / radix);
          }
          return res || "0";
        };
        const result = p.replace(/\b\w+\b/g, (e) => {
          const index = parseInt(e, 36);
          let word = kArr[index];
          if (!word) {
            const altIndex = parseInt(e, a);
            word = kArr[altIndex];
          }
          return word || e;
        });
        return result;
      } catch (e) {
        console.error("[Unpacker] Error des-empaquetando:", e.message);
        return code;
      }
    }
    module2.exports = { unpack };
  }
});

// src/shared/resolvers/vidhide.js
var require_vidhide = __commonJS({
  "src/shared/resolvers/vidhide.js"(exports2, module2) {
    var { unpack } = require_unpacker();
    var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function resolveVidhide(url) {
      return __async(this, null, function* () {
        var _a;
        try {
          console.log(`[Resolvers] Resolviendo VidHide: ${url}`);
          const origin = new URL(url).origin;
          const response = yield fetch(url, {
            headers: {
              "User-Agent": USER_AGENT,
              "Referer": "https://embed69.org/"
            }
          });
          const html = yield response.text();
          const evalMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
          let contentToSearch = html;
          if (evalMatch) {
            contentToSearch = unpack(evalMatch[0]);
          }
          const hls4 = contentToSearch.match(/"?hls4"?\s*:\s*"([^"]+)"/);
          const hls2 = contentToSearch.match(/"?hls2"?\s*:\s*"([^"]+)"/);
          const link = (_a = hls4 || hls2) == null ? void 0 : _a[1];
          if (!link)
            return null;
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
    var { unpack } = require_unpacker();
    var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function resolveStreamwish(url) {
      return __async(this, null, function* () {
        try {
          console.log(`[Resolvers] Resolviendo Streamwish: ${url}`);
          let fetchUrl = url.replace("hglink.to", "vibuxer.com");
          const originMatch = fetchUrl.match(/^(https?:\/\/[^\/]+)/);
          const origin = originMatch ? originMatch[1] : "";
          const response = yield fetch(fetchUrl, {
            headers: {
              "User-Agent": USER_AGENT,
              "Referer": "https://embed69.org/",
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8"
            }
          });
          const html = yield response.text();
          const evalMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/);
          let contentToSearch = html;
          if (evalMatch) {
            contentToSearch += "\n" + unpack(evalMatch[0]);
          }
          const fileMatch = contentToSearch.match(/(?:file|source|src)\s*:\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i);
          if (fileMatch) {
            let streamUrl = fileMatch[1];
            if (streamUrl.startsWith("/")) {
              streamUrl = origin + streamUrl;
            }
            return { url: streamUrl, quality: "Auto", headers: { "Referer": origin + "/" } };
          }
          const m3u8Fallback = contentToSearch.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
          if (m3u8Fallback) {
            return { url: m3u8Fallback[0], quality: "Auto", headers: { "Referer": origin + "/" } };
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
    function localAtob(input) {
      if (!input)
        return "";
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
      let str = String(input).replace(/=+$/, "").replace(/[\s\n\r\t]/g, "");
      let output = "";
      if (str.length % 4 === 1)
        return "";
      for (let bc = 0, bs, buffer, idx = 0; buffer = str.charAt(idx++); ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer, bc++ % 4) ? output += String.fromCharCode(255 & bs >> (-2 * bc & 6)) : 0) {
        buffer = chars.indexOf(buffer);
      }
      return output;
    }
    function resolveVoe(url) {
      return __async(this, null, function* () {
        try {
          console.log(`[VOE] Resolviendo: ${url}`);
          let response = yield fetch(url, { headers: { "User-Agent": USER_AGENT, "Referer": url } });
          let html = yield response.text();
          if (html.includes("permanentToken")) {
            const redirectMatch = html.match(/window\.location\.href\s*=\s*'([^']+)'/i);
            if (redirectMatch) {
              console.log(`[VOE] Siguiendo redirecci\xF3n de token: ${redirectMatch[1]}`);
              response = yield fetch(redirectMatch[1], { headers: { "User-Agent": USER_AGENT, "Referer": url } });
              html = yield response.text();
            }
          }
          if (html.includes("window.location.href") && html.length < 2e3) {
            const rm = html.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/i);
            if (rm)
              return resolveVoe(rm[1]);
          }
          const jsonMatch = html.match(/<script type="application\/json">([\s\S]*?)<\/script>/);
          if (jsonMatch) {
            try {
              const parsed = JSON.parse(jsonMatch[1].trim());
              let encText = Array.isArray(parsed) ? parsed[0] : parsed;
              if (typeof encText !== "string")
                return null;
              let decoded = encText.replace(/[a-zA-Z]/g, (c) => {
                const code = c.charCodeAt(0);
                const limit = c <= "Z" ? 90 : 122;
                const shifted = code + 13;
                return String.fromCharCode(limit >= shifted ? shifted : shifted - 26);
              });
              const noise = ["@$", "^^", "~@", "%?", "*~", "!!", "#&"];
              for (const n of noise)
                decoded = decoded.split(n).join("");
              const b64_1 = localAtob(decoded);
              if (!b64_1)
                throw new Error("Stage 1 failed");
              let shiftedStr = "";
              for (let j = 0; j < b64_1.length; j++) {
                shiftedStr += String.fromCharCode(b64_1.charCodeAt(j) - 3);
              }
              const reversed = shiftedStr.split("").reverse().join("");
              const decrypted = localAtob(reversed);
              if (!decrypted)
                throw new Error("Stage 2 failed");
              const data = JSON.parse(decrypted);
              if (data && data.source) {
                console.log(`[Resolvers] VOE Success! Enlace extra\xEDdo.`);
                return {
                  url: data.source,
                  quality: "1080p",
                  verified: true,
                  headers: {
                    "User-Agent": USER_AGENT,
                    "Referer": url
                  }
                };
              }
            } catch (ex) {
              console.error(`[Resolvers] VOE Decryption error: ${ex.message}`);
            }
          }
          const m3u8Match = html.match(/["'](https?:\/\/[^"']+?\.m3u8[^"']*?)["']/i);
          if (m3u8Match && !m3u8Match[1].includes("test-videos.co.uk")) {
            return {
              url: m3u8Match[1],
              quality: "Auto",
              verified: false,
              headers: { "Referer": url, "User-Agent": USER_AGENT }
            };
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

// src/shared/utils/aes_gcm.js
var require_aes_gcm = __commonJS({
  "src/shared/utils/aes_gcm.js"(exports2, module2) {
    var _CryptoJS = typeof CryptoJS !== "undefined" ? CryptoJS : null;
    function parseB64(b64) {
      if (!b64 || !_CryptoJS)
        return null;
      try {
        const normalized = b64.replace(/-/g, "+").replace(/_/g, "/");
        return _CryptoJS.enc.Base64.parse(normalized);
      } catch (e) {
        return null;
      }
    }
    function decryptGCM(keyWA, ivWA, ciphertextWithTagWA) {
      try {
        if (!keyWA || !ivWA || !ciphertextWithTagWA || !_CryptoJS)
          return null;
        const tagSizeWords = 4;
        const ciphertextWords = ciphertextWithTagWA.words.slice(0, ciphertextWithTagWA.words.length - tagSizeWords);
        const ciphertextWA = _CryptoJS.lib.WordArray.create(
          ciphertextWords,
          ciphertextWithTagWA.sigBytes - 16
        );
        let counterWA = ivWA.clone();
        counterWA.concat(_CryptoJS.lib.WordArray.create([2], 4));
        const decrypted = _CryptoJS.AES.decrypt(
          { ciphertext: ciphertextWA },
          keyWA,
          {
            iv: counterWA,
            mode: _CryptoJS.mode.CTR,
            padding: _CryptoJS.pad.NoPadding
          }
        );
        return decrypted.toString(_CryptoJS.enc.Utf8);
      } catch (e) {
        console.error("[AES-GCM] Error:", e.message);
        return null;
      }
    }
    function decryptByse(playback) {
      try {
        if (!playback || !playback.key_parts || !playback.payload || !playback.iv || !_CryptoJS)
          return null;
        let keyWA = parseB64(playback.key_parts[0]);
        for (let i = 1; i < playback.key_parts.length; i++) {
          const part = parseB64(playback.key_parts[i]);
          if (part)
            keyWA.concat(part);
        }
        const ivWA = parseB64(playback.iv);
        const ciphertextWithTagWA = parseB64(playback.payload);
        return decryptGCM(keyWA, ivWA, ciphertextWithTagWA);
      } catch (e) {
        console.error("[Byse] Failed:", e.message);
        return null;
      }
    }
    module2.exports = { decryptByse };
  }
});

// src/shared/resolvers/filemoon.js
var require_filemoon = __commonJS({
  "src/shared/resolvers/filemoon.js"(exports2, module2) {
    var { unpack } = require_unpacker();
    var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    var { decryptByse } = require_aes_gcm();
    function resolveFilemoon(url) {
      return __async(this, null, function* () {
        var _a, _b, _c, _d;
        try {
          console.log(`[Resolvers] Filemoon Shield-Resolving: ${url}`);
          const urlObj = new URL(url);
          const hostname = urlObj.hostname;
          const videoId = urlObj.pathname.split("/").filter((p) => !!p).pop();
          if (!videoId)
            return null;
          try {
            const playbackUrl = `https://${hostname}/api/videos/${videoId}/embed/playback`;
            console.log(`[Resolvers] Filemoon consultando API Playback...`);
            const response2 = yield fetch(playbackUrl, {
              headers: {
                "User-Agent": USER_AGENT,
                "Referer": url,
                "Origin": `https://${hostname}`,
                "X-Embed-Parent": url
              }
            });
            if (response2.ok) {
              const playbackData = yield response2.json();
              if (playbackData && playbackData.playback) {
                const decrypted = decryptByse(playbackData.playback);
                if (decrypted) {
                  const data = JSON.parse(decrypted);
                  const directUrl = ((_b = (_a = data == null ? void 0 : data.sources) == null ? void 0 : _a[0]) == null ? void 0 : _b.url) || (data == null ? void 0 : data.url);
                  if (directUrl) {
                    console.log(`[Resolvers] Filemoon Shield Success!`);
                    return {
                      url: directUrl,
                      quality: ((_d = (_c = data == null ? void 0 : data.sources) == null ? void 0 : _c[0]) == null ? void 0 : _d.label) || "1080p",
                      verified: true,
                      headers: {
                        "User-Agent": USER_AGENT,
                        "Referer": `https://${hostname}/`,
                        "Origin": `https://${hostname}`
                      }
                    };
                  }
                }
              }
            }
          } catch (e) {
            console.log(`[Resolvers] Filemoon Shield Fall\xF3: ${e.message}`);
          }
          console.log(`[Resolvers] Filemoon Fallback: Buscando Packer...`);
          let response = yield fetch(url, {
            headers: { "User-Agent": USER_AGENT, "Referer": "https://embed69.org/" }
          });
          let html = yield response.text();
          const evalMatch = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/g);
          let contentToSearch = html;
          if (evalMatch) {
            evalMatch.forEach((m) => {
              try {
                contentToSearch += "\n" + unpack(m);
              } catch (e) {
              }
            });
          }
          const fileMatch = contentToSearch.match(/(?:file|source|src|hls|url)\s*[:=]\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)["']/i);
          if (fileMatch) {
            return {
              url: fileMatch[1],
              quality: "Auto",
              headers: { "Referer": url }
            };
          }
          return null;
        } catch (e) {
          console.error(`[Resolvers] Error en Filemoon: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = resolveFilemoon;
  }
});

// src/shared/utils/m3u8.js
var require_m3u8 = __commonJS({
  "src/shared/utils/m3u8.js"(exports2, module2) {
    var m3u8Parser = {
      getQualityFromHeight(height) {
        const h = parseInt(height);
        if (h >= 2160)
          return "4K";
        if (h >= 1440)
          return "1440p";
        if (h >= 1080)
          return "1080p";
        if (h >= 720)
          return "720p";
        if (h >= 480)
          return "480p";
        if (h >= 360)
          return "360p";
        return null;
      },
      /**
       * Busca patrones de calidad 100% seguros en la URL para evitar descargas innecesarias
       */
      getQualityFromSafePatterns(url) {
        if (!url)
          return null;
        const u = url.toLowerCase();
        if (u.includes(",h,.urlset"))
          return "1080p";
        if (u.includes(",n,.urlset"))
          return "720p";
        if (u.includes(",l,.urlset"))
          return "480p";
        const standardMatch = u.match(/[_-](1080|720|480|360)p?(\.m3u8|$|\?)/);
        if (standardMatch)
          return standardMatch[1] + "p";
        return null;
      },
      getQualityFromContent(content) {
        if (!content)
          return null;
        try {
          const lines = content.split("\n");
          let bestHeight = 0;
          for (const line of lines) {
            if (line.includes("RESOLUTION=")) {
              const match = line.match(/RESOLUTION=\d+x(\d+)/i);
              if (match) {
                const height = parseInt(match[1]);
                if (height > bestHeight)
                  bestHeight = height;
              }
            }
          }
          return bestHeight > 0 ? this.getQualityFromHeight(bestHeight) : null;
        } catch (e) {
          return null;
        }
      },
      detectRealQuality(_0) {
        return __async(this, arguments, function* (url, headers = {}) {
          try {
            const fastQuality = this.getQualityFromSafePatterns(url);
            if (fastQuality)
              return { quality: fastQuality, error: null };
            const response = yield fetch(url, { headers }).catch(() => null);
            if (!response || !response.ok)
              return null;
            const content = yield response.text();
            const realQuality = this.getQualityFromContent(content);
            return realQuality ? { quality: realQuality, error: null } : null;
          } catch (e) {
            return null;
          }
        });
      }
    };
    module2.exports = m3u8Parser;
  }
});

// src/shared/resolvers/index.js
var require_resolvers = __commonJS({
  "src/shared/resolvers/index.js"(exports2, module2) {
    var resolveVidhide = require_vidhide();
    var resolveStreamwish = require_streamwish();
    var resolveVoe = require_voe();
    var resolveFilemoon = require_filemoon();
    var m3u8Parser = require_m3u8();
    var registry = {
      vidhide: resolveVidhide,
      streamwish: resolveStreamwish,
      filemoon: resolveFilemoon,
      voe: resolveVoe
    };
    function resolve(servername, url) {
      return __async(this, null, function* () {
        const name = String(servername).toLowerCase().trim();
        if (registry[name]) {
          const result = yield registry[name](url);
          if (result && result.url) {
            console.log(`[Resolvers] Detectando calidad real para: ${name}`);
            const detection = yield m3u8Parser.detectRealQuality(result.url, result.headers || {});
            if (detection && detection.quality) {
              console.log(`[Resolvers] Calidad detectada: ${detection.quality}`);
              result.quality = detection.quality;
              result.verified = true;
            } else if (detection && detection.error) {
              result.debug = detection.error;
            }
          }
          return result;
        }
        return null;
      });
    }
    module2.exports = { resolve };
  }
});

// src/sololatino/extractor.js
var require_extractor = __commonJS({
  "src/sololatino/extractor.js"(exports2, module2) {
    var tmdb = require_tmdb();
    var resolvers = require_resolvers();
    var host = "https://player.pelisserieshoy.com";
    var refererBase = "https://sololatino.net/";
    function getStreams2(tmdbId, mediaType, season, episode) {
      return __async(this, null, function* () {
        try {
          console.log(`[SoloLatino] B\xFAsqueda sigilosa: ${mediaType} ID:${tmdbId}`);
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
          const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";
          const headers = {
            "User-Agent": UA,
            "Referer": refererBase,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
            "Cache-Control": "no-cache",
            "Pragma": "no-cache"
          };
          const response = yield fetch(playerUrl, { headers });
          if (!response.ok)
            return [];
          const html = yield response.text();
          const cookie = response.headers.get("set-cookie") || "";
          const tokenMatch = html.match(/(?:let\s+token|const\s+_t|tok|_t|token)\s*.*['"]([a-f0-9]{32})['"]/);
          if (!tokenMatch)
            return [];
          const token = tokenMatch[1];
          const postHeaders = __spreadProps(__spreadValues({}, headers), {
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
            "Referer": playerUrl,
            "X-Requested-With": "XMLHttpRequest"
          });
          if (cookie)
            postHeaders["Cookie"] = cookie;
          yield fetch(`${host}/s.php`, {
            method: "POST",
            body: `a=click&tok=${token}`,
            headers: postHeaders
          });
          if (typeof process !== "undefined")
            yield new Promise((r) => setTimeout(r, 1e3));
          const scanRes = yield fetch(`${host}/s.php`, {
            method: "POST",
            body: `a=1&tok=${token}`,
            headers: postHeaders
          });
          if (!scanRes.ok)
            return [];
          const scanData = yield scanRes.json();
          let rawServers = [];
          if (scanData.langs_s && scanData.langs_s.LAT) {
            rawServers = scanData.langs_s.LAT;
          } else if (scanData.s) {
            rawServers = scanData.s;
          }
          if (rawServers.length === 0)
            return [];
          const streams = [];
          const topServers = rawServers.slice(0, 3);
          for (const srv of topServers) {
            try {
              if (typeof process !== "undefined")
                yield new Promise((r) => setTimeout(r, 1200));
              const srvRes = yield fetch(`${host}/s.php`, {
                method: "POST",
                body: `a=2&v=${srv[1]}&tok=${token}`,
                headers: postHeaders
              });
              const srvData = yield srvRes.json();
              if (!srvData || !srvData.u)
                continue;
              let embedUrl = srvData.u;
              if (srvData.sig) {
                embedUrl = `${host}/p.php?url=${encodeURIComponent(srvData.u)}&sig=${srvData.sig}`;
              }
              const isProxy = embedUrl.includes("p.php?url=");
              const isInternal = embedUrl.startsWith("/p.php?v=");
              if (isProxy || isInternal) {
                const fullUrl = isInternal ? `${host}${embedUrl}` : embedUrl;
                let realSrv = srv[0];
                if (fullUrl.includes("minochinos") || fullUrl.includes("masukestin"))
                  realSrv = "VidHide";
                else if (fullUrl.includes("r66nv9ed"))
                  realSrv = "Filemoon";
                else if (fullUrl.includes("cloudwindow"))
                  realSrv = "VOE";
                const formatServer = (name) => {
                  if (!name)
                    return "Unknown";
                  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                };
                streams.push({
                  name: `SoloLatino - ${formatServer(realSrv)}`,
                  url: fullUrl,
                  quality: "1080p \u2705",
                  language: "Latino",
                  headers: { "Referer": playerUrl, "User-Agent": UA }
                });
              } else {
                const res = yield resolvers.resolve(srv[0], embedUrl);
                if (res && res.url) {
                  const formatServer = (name) => {
                    if (!name)
                      return "Unknown";
                    return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
                  };
                  streams.push({
                    name: `SoloLatino - ${formatServer(srv[0])}`,
                    url: res.url,
                    quality: `${res.quality || "1080p"} \u2705`,
                    language: "Latino",
                    headers: res.headers || { "Referer": playerUrl }
                  });
                }
              }
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
