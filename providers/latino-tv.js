/**
 * latino-tv - Plugin Nuvio
 * Generado: 2026-04-20T13:58:55.409Z
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

// src/latino-tv/http.js
var require_http = __commonJS({
  "src/latino-tv/http.js"(exports2, module2) {
    var axios = require("axios");
    var http = {
      get(_0) {
        return __async(this, arguments, function* (url, headers = {}) {
          try {
            const response = yield axios.get(url, {
              headers: __spreadValues({
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
              }, headers)
            });
            return response.data;
          } catch (error) {
            console.error(`[HTTP GET Error] ${url}:`, error.message);
            throw error;
          }
        });
      },
      post(_0, _1) {
        return __async(this, arguments, function* (url, data, headers = {}) {
          try {
            const response = yield axios.post(url, data, { headers });
            return response.data;
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

// src/latino-tv/extractor.js
var require_extractor = __commonJS({
  "src/latino-tv/extractor.js"(exports2, module2) {
    var http = require_http();
    var extractor2 = {
      search(title, type) {
        return __async(this, null, function* () {
          console.log(`Buscando: ${title} (${type})`);
          return [];
        });
      },
      getLinks(id, type, season, episode) {
        return __async(this, null, function* () {
          console.log(`Obteniendo links para ID: ${id}`);
          return [
            {
              name: "Latino TV",
              title: "Latino - 1080p",
              url: "https://ejemplo.com/stream.m3u8",
              quality: "1080p",
              headers: {
                "Referer": "https://ejemplo.com/"
              }
            }
          ];
        });
      }
    };
    module2.exports = extractor2;
  }
});

// src/latino-tv/index.js
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
