/**
 * cinehdplus - Plugin Nuvio
 * Generado: 2026-04-27T22:55:14.862Z
 */
var __getOwnPropNames = Object.getOwnPropertyNames;
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
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
          });
          const data = yield response.json();
          return data.imdb_id || null;
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
          console.log(`[TMDB] Detalles (${type}): ${tmdbId}`);
          const response = yield fetch(url, {
            headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
          });
          if (!response.ok)
            return null;
          return yield response.json();
        } catch (e) {
          console.error("[TMDB] Error obteniendo detalles:", e.message);
          return null;
        }
      });
    }
    module2.exports = { getImdbId, getDetails };
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

// src/shared/resolvers/vidhide.js
var require_vidhide = __commonJS({
  "src/shared/resolvers/vidhide.js"(exports2, module2) {
    var { unpack } = require_unpacker();
    var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function resolveVidhide(url, customReferer) {
      return __async(this, null, function* () {
        var _a;
        try {
          console.log(`[Resolvers] Resolviendo VidHide: ${url}`);
          const origin = new URL(url).origin;
          const referer = customReferer || "https://embed69.org/";
          const response = yield fetch(url, {
            headers: {
              "User-Agent": USER_AGENT,
              "Referer": referer
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
            headers: {
              "User-Agent": USER_AGENT,
              "Referer": `${origin}/`
            }
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

// src/shared/resolvers/streamtape.js
var require_streamtape = __commonJS({
  "src/shared/resolvers/streamtape.js"(exports2, module2) {
    var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function resolveStreamtape(url) {
      return __async(this, null, function* () {
        try {
          console.log(`[Resolvers] Streamtape: ${url}`);
          const origin = new URL(url).origin;
          const response = yield fetch(url, {
            headers: { "User-Agent": USER_AGENT, "Referer": origin + "/" }
          });
          if (!response.ok)
            return null;
          const html = yield response.text();
          const vidconfigMatch = html.match(/var\s+vidconfig\s*=\s*(\{[^;]+\})/);
          if (vidconfigMatch) {
            try {
              const vidconfig = JSON.parse(vidconfigMatch[1]);
              const videoId = vidconfig.id;
              if (videoId) {
                const apiUrl = `${origin}/api/video/view?id=${videoId}`;
                const apiRes = yield fetch(apiUrl, {
                  headers: { "User-Agent": USER_AGENT, "Referer": url }
                });
                if (apiRes.ok) {
                  const data = yield apiRes.json();
                  if (data && data.result) {
                    const streamUrl = data.result.startsWith("//") ? "https:" + data.result : data.result;
                    return {
                      url: streamUrl,
                      quality: "HD",
                      headers: { "User-Agent": USER_AGENT, "Referer": origin + "/" }
                    };
                  }
                }
              }
            } catch (_) {
            }
          }
          const partA = html.match(/id="ideoolink">\s*<a[^>]*href="([^"]+)"/i);
          if (partA) {
            let streamUrl = partA[1];
            if (streamUrl.startsWith("//"))
              streamUrl = "https:" + streamUrl;
            return {
              url: streamUrl,
              quality: "HD",
              headers: { "User-Agent": USER_AGENT, "Referer": origin + "/" }
            };
          }
          const tokenMatch = html.match(/document\.getElementById\('ideoolink'\)\.innerHTML\s*=\s*["']([^"']+)["']/i);
          if (tokenMatch) {
            let streamUrl = tokenMatch[1].replace(/\\'/g, "'").replace(/\\"/g, '"');
            const hrefMatch = streamUrl.match(/href=["']([^"']+)["']/i);
            if (hrefMatch) {
              let finalUrl = hrefMatch[1];
              if (finalUrl.startsWith("//"))
                finalUrl = "https:" + finalUrl;
              return {
                url: finalUrl,
                quality: "HD",
                headers: { "User-Agent": USER_AGENT, "Referer": origin + "/" }
              };
            }
          }
          const tapeMatch = html.match(/https?:\/\/[^"'\s]+tapecontent\.net[^"'\s]*/i);
          if (tapeMatch) {
            return {
              url: tapeMatch[0],
              quality: "HD",
              headers: { "User-Agent": USER_AGENT, "Referer": origin + "/" }
            };
          }
          return null;
        } catch (e) {
          console.error(`[Resolvers] Error Streamtape: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = resolveStreamtape;
  }
});

// src/shared/resolvers/generic_packer.js
var require_generic_packer = __commonJS({
  "src/shared/resolvers/generic_packer.js"(exports2, module2) {
    var { unpack } = require_unpacker();
    var USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function resolveGenericPacker(url, referer) {
      return __async(this, null, function* () {
        try {
          console.log(`[Resolvers] GenericPacker: ${url}`);
          const origin = new URL(url).origin;
          const response = yield fetch(url, {
            headers: {
              "User-Agent": USER_AGENT,
              "Referer": referer || origin + "/"
            }
          });
          if (!response.ok)
            return null;
          const html = yield response.text();
          let contentToSearch = html;
          const evalMatches = html.match(/eval\(function\(p,a,c,k,e,[rd]\)[\s\S]*?\.split\('\|'\)[^\)]*\)\)/g);
          if (evalMatches) {
            for (const em of evalMatches) {
              try {
                contentToSearch += "\n" + unpack(em);
              } catch (e) {
              }
            }
          }
          const fileMatch = contentToSearch.match(/(?:file|source|src|hls|stream_url|url)\s*[=:]\s*["']([^"']+\.(?:m3u8|mp4)[^"']*)['"]/i);
          if (fileMatch) {
            let streamUrl = fileMatch[1];
            if (streamUrl.startsWith("/"))
              streamUrl = origin + streamUrl;
            return {
              url: streamUrl,
              quality: "Auto",
              headers: { "Referer": origin + "/", "User-Agent": USER_AGENT }
            };
          }
          const m3u8Match = contentToSearch.match(/https?:\/\/[^"'\s\\]+\.m3u8[^"'\s\\]*/i);
          if (m3u8Match) {
            return {
              url: m3u8Match[0],
              quality: "Auto",
              headers: { "Referer": origin + "/", "User-Agent": USER_AGENT }
            };
          }
          return null;
        } catch (e) {
          console.error(`[Resolvers] Error GenericPacker: ${e.message}`);
          return null;
        }
      });
    }
    module2.exports = resolveGenericPacker;
  }
});

// src/cinehdplus/extractor.js
var require_extractor = __commonJS({
  "src/cinehdplus/extractor.js"(exports2, module2) {
    var cheerio = require("cheerio");
    var tmdb = require_tmdb();
    var resolveVoe = require_voe();
    var resolveStreamwish = require_streamwish();
    var resolveVidhide = require_vidhide();
    var resolveFilemoon = require_filemoon();
    var resolveStreamtape = require_streamtape();
    var resolveGenericPacker = require_generic_packer();
    var baseURL = "https://cinehdplus.org";
    var apiURL = "https://api.cinehdplus.org";
    var NUVIO_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    function getResolverForUrl(url) {
      const lower = url.toLowerCase();
      if (lower.includes("voe.sx") || lower.includes("voe."))
        return { fn: resolveVoe, name: "voe" };
      if (lower.includes("streamwish") || lower.includes("vibuxer"))
        return { fn: resolveStreamwish, name: "streamwish" };
      if (lower.includes("vidhide") || lower.includes("vidsrc"))
        return { fn: resolveVidhide, name: "vidhide" };
      if (lower.includes("filemoon") || lower.includes("moonplayer"))
        return { fn: resolveFilemoon, name: "filemoon" };
      if (lower.includes("streamtape"))
        return { fn: resolveStreamtape, name: "streamtape" };
      if (lower.includes("mixdrop"))
        return { fn: resolveGenericPacker, name: "mixdrop" };
      return null;
    }
    function rot13Decode(str) {
      return str.replace(/[a-zA-Z]/g, function(c) {
        return String.fromCharCode(
          (c <= "Z" ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26
        );
      });
    }
    function resolveCineHDUrl(hash, referer) {
      return __async(this, null, function* () {
        try {
          const step1Url = `${apiURL}/ir/goto.php?h=${hash}`;
          const step1Res = yield fetch(step1Url, {
            headers: { "User-Agent": NUVIO_UA, "Referer": referer }
          });
          if (!step1Res.ok)
            return null;
          const step1Html = yield step1Res.text();
          const $1 = cheerio.load(step1Html);
          const form1Value = $1('input[name="url"]').attr("value");
          if (!form1Value)
            return null;
          const step2Body = new URLSearchParams();
          step2Body.append("url", form1Value);
          const step2Res = yield fetch(`${apiURL}/ir/rd.php`, {
            method: "POST",
            headers: { "User-Agent": NUVIO_UA, "Referer": step1Url },
            body: step2Body
          });
          const step2Html = yield step2Res.text();
          const $2 = cheerio.load(step2Html);
          const form2Value = $2('input[name="url"]').attr("value");
          const form2Dl = $2('input[name="dl"]').attr("value") || "0";
          const form2Action = $2("form#FbAns").attr("action") || "redir_ddh.php";
          if (!form2Value)
            return null;
          const step3Url = `${apiURL}/ir/${form2Action}`;
          const step3Body = new URLSearchParams();
          step3Body.append("url", form2Value);
          step3Body.append("dl", form2Dl);
          const step3Res = yield fetch(step3Url, {
            method: "POST",
            headers: { "User-Agent": NUVIO_UA, "Referer": `${apiURL}/ir/go_ddh.php` },
            body: step3Body
          });
          if (!step3Res.ok)
            return null;
          const step3Html = yield step3Res.text();
          const $3 = cheerio.load(step3Html);
          const encodedVid = $3('input[name="vid"]').attr("value");
          if (!encodedVid)
            return null;
          const base64Decoded = atob(encodedVid);
          const playerUrl = rot13Decode(base64Decoded);
          console.log(`[CineHDPlus] Reproductor externo: ${playerUrl}`);
          return playerUrl;
        } catch (e) {
          console.error("[CineHDPlus] Error resolviendo hash:", e.message);
          return null;
        }
      });
    }
    function searchInSite(query, year) {
      return __async(this, null, function* () {
        try {
          const response = yield fetch(`${baseURL}/?s=${encodeURIComponent(query)}`, {
            headers: {
              "User-Agent": NUVIO_UA,
              "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8"
            }
          });
          if (!response.ok)
            return null;
          const html = yield response.text();
          const $ = cheerio.load(html);
          let foundUrl = null;
          $(".card").each((i, el) => {
            const href = $(el).find(".card__cover a").first().attr("href");
            const itemYear = $(el).find(".year").text().trim();
            if (href && !foundUrl) {
              if (year && itemYear && itemYear.includes(year)) {
                foundUrl = href;
              } else if (!year) {
                foundUrl = href;
              }
            }
          });
          return foundUrl || $(".card .card__cover a").first().attr("href");
        } catch (e) {
          console.error("[CineHDPlus] Error en b\xFAsqueda:", e.message);
          return null;
        }
      });
    }
    function extractStreamsFromUrl(url) {
      return __async(this, null, function* () {
        try {
          const response = yield fetch(url, {
            headers: { "User-Agent": NUVIO_UA, "Accept": "text/html,application/xhtml+xml" }
          });
          if (!response.ok)
            return [];
          const html = yield response.text();
          const $ = cheerio.load(html);
          const rawItems = [];
          const seenHashes = /* @__PURE__ */ new Set();
          const playerMap = {};
          $(".submenu_lang li[data-tplayernv]").each((i, el) => {
            const id = $(el).attr("data-tplayernv");
            const name = $(el).find("span").text().trim();
            const lang = $(el).attr("data-lang") === "lat" ? "Latino" : "Castellano";
            playerMap[id] = { name, lang };
          });
          $("iframe").each((i, el) => {
            const src = $(el).attr("data-src") || $(el).attr("src");
            if (src && src.includes("player.php?h=")) {
              const parentId = $(el).closest(".embed_url").attr("id");
              const info = playerMap[parentId] || { name: `CineHD+ ${i + 1}`, lang: "Latino" };
              try {
                const u = new URL(src.startsWith("//") ? "https:" + src : src);
                const h = u.searchParams.get("h");
                if (h && !seenHashes.has(h)) {
                  seenHashes.add(h);
                  rawItems.push({ hash: h, name: info.name, lang: info.lang, referer: src });
                }
              } catch (_) {
              }
            }
          });
          $("li[data-url]").each((i, el) => {
            const dataUrl = $(el).attr("data-url");
            if (dataUrl && dataUrl.includes("player.php?h=")) {
              try {
                const u = new URL(dataUrl.startsWith("//") ? "https:" + dataUrl : dataUrl);
                const h = u.searchParams.get("h");
                if (h && !seenHashes.has(h)) {
                  seenHashes.add(h);
                  rawItems.push({ hash: h, name: `CineHD+ ${i + 1}`, lang: "Latino", referer: dataUrl });
                }
              } catch (_) {
              }
            }
          });
          if (rawItems.length === 0) {
            console.log("[CineHDPlus] No se encontraron reproductores.");
            return [];
          }
          console.log(`[CineHDPlus] ${rawItems.length} enlace(s) encontrados. Resolviendo a m3u8/mp4...`);
          const streams = [];
          for (const item of rawItems) {
            if (item.lang !== "Latino") {
              console.log(`[CineHDPlus] Omitiendo ${item.name} (${item.lang})`);
              continue;
            }
            const playerUrl = yield resolveCineHDUrl(item.hash, item.referer);
            if (!playerUrl)
              continue;
            const resolverInfo = getResolverForUrl(playerUrl);
            if (!resolverInfo) {
              console.log(`[CineHDPlus] Sin resolver para: ${playerUrl}`);
              continue;
            }
            console.log(`[CineHDPlus] Usando resolver '${resolverInfo.name}' para: ${playerUrl}`);
            const resolved = yield resolverInfo.fn(playerUrl, baseURL);
            if (resolved && resolved.url) {
              streams.push({
                name: item.name || "CineHD+",
                url: resolved.url,
                quality: resolved.quality || "HD",
                language: item.lang,
                headers: resolved.headers || { "User-Agent": NUVIO_UA, "Referer": baseURL }
              });
              console.log(`[CineHDPlus] \u2705 m3u8/mp4: ${resolved.url}`);
            } else {
              console.log(`[CineHDPlus] \u274C No se pudo extraer m3u8 de: ${playerUrl}`);
            }
          }
          return streams;
        } catch (e) {
          console.error("[CineHDPlus] Error extrayendo streams:", e.message);
          return [];
        }
      });
    }
    function getStreams2(tmdbId, mediaType, season, episode) {
      return __async(this, null, function* () {
        console.log(`[CineHDPlus] v3.0.0 (Full Resolver): ${mediaType} ID:${tmdbId}`);
        try {
          const tmdbDetails = yield tmdb.getDetails(tmdbId, mediaType);
          if (!tmdbDetails)
            return [];
          const title = tmdbDetails.title || tmdbDetails.name || tmdbDetails.original_title;
          const year = (tmdbDetails.release_date || tmdbDetails.first_air_date || "").substring(0, 4);
          let itemUrl = yield searchInSite(title, year);
          if (!itemUrl)
            return [];
          console.log(`[CineHDPlus] URL encontrada:`, itemUrl);
          if (mediaType === "tv") {
            const showHtmlRes = yield fetch(itemUrl, { headers: { "User-Agent": NUVIO_UA } });
            if (!showHtmlRes.ok)
              return [];
            const showHtml = yield showHtmlRes.text();
            const $s = cheerio.load(showHtml);
            let epUrl = null;
            $s(".episodios li a, .se-ep a, .episodios a").each((i, el) => {
              const href = $s(el).attr("href");
              const text = $s(el).text().trim();
              if (href && (href.includes(`-${season}x${episode}-`) || text.includes(`${season}x${episode}`))) {
                epUrl = href;
              }
            });
            if (!epUrl) {
              const slugMatch = itemUrl.match(/serie-tv-\d+\/(.*?)(?:-online-hd)?\/?$/);
              if (slugMatch && slugMatch[1]) {
                const slug = slugMatch[1].replace("-online-hd", "");
                epUrl = `${baseURL}/episodios/${slug}-${season}x${episode}/`;
                console.log(`[CineHDPlus] URL episodio inferida:`, epUrl);
              }
            }
            if (!epUrl)
              return [];
            itemUrl = epUrl;
          }
          return yield extractStreamsFromUrl(itemUrl);
        } catch (e) {
          console.error("[CineHDPlus] Error general:", e.message);
          return [];
        }
      });
    }
    module2.exports = { getStreams: getStreams2 };
  }
});

// src/cinehdplus/index.js
var { getStreams } = require_extractor();
module.exports = {
  getStreams
};
