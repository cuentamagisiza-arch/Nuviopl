/*
 * FuegoCine - Nuvio
 * Fuente: Modlyo API
 */

var API_URL = "https://www.modlyo.com/api/servidores.php";

var HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
  "Accept": "application/json"
};

function getQuality(value) {
  if (!value) {
    return "HD";
  }

  var q = String(value).toUpperCase();

  if (q.indexOf("2160") !== -1 || q.indexOf("4K") !== -1) {
    return "4K";
  }

  if (q.indexOf("1440") !== -1) {
    return "1440p";
  }

  if (q.indexOf("1080") !== -1) {
    return "1080p";
  }

  if (q.indexOf("720") !== -1) {
    return "720p";
  }

  if (q.indexOf("480") !== -1) {
    return "480p";
  }

  if (q.indexOf("360") !== -1) {
    return "360p";
  }

  return String(value);
}

function getLanguage(value) {
  if (!value) {
    return "Latino";
  }

  var lang = String(value).toLowerCase();

  if (
    lang.indexOf("es_es") !== -1 ||
    lang.indexOf("es-es") !== -1 ||
    lang.indexOf("esp") !== -1 ||
    lang.indexOf("castellano") !== -1
  ) {
    return "Castellano";
  }

  if (
    lang.indexOf("sub") !== -1 ||
    lang.indexOf("vose") !== -1 ||
    lang.indexOf("ingles") !== -1 ||
    lang === "en"
  ) {
    return "Subtitulado";
  }

  return "Latino";
}

function isPlayableUrl(url) {
  if (!url) {
    return false;
  }

  var u = String(url).toLowerCase();

  return (
    u.indexOf(".m3u8") !== -1 ||
    u.indexOf(".mp4") !== -1 ||
    u.indexOf(".mkv") !== -1 ||
    u.indexOf(".webm") !== -1
  );
}

function getStreams(tmdbId, mediaType, season, episode) {
  var type =
    mediaType === "movie"
      ? "movie"
      : "tv";

  var url =
    API_URL +
    "?tmdbId=" +
    encodeURIComponent(String(tmdbId)) +
    "&type=" +
    encodeURIComponent(type);

  if (type === "tv") {
    if (
      season === null ||
      season === undefined ||
      episode === null ||
      episode === undefined
    ) {
      console.log(
        "[FuegoCine] Faltan season/episode"
      );

      return Promise.resolve([]);
    }

    url +=
      "&season=" +
      encodeURIComponent(String(season));

    url +=
      "&episode=" +
      encodeURIComponent(String(episode));
  }

  console.log(
    "[FuegoCine] API:",
    url
  );

  return fetch(url, {
    method: "GET",
    headers: HEADERS
  })
    .then(function(response) {
      if (!response.ok) {
        throw new Error(
          "HTTP " + response.status
        );
      }

      return response.json();
    })
    .then(function(data) {
      if (!data) {
        return [];
      }

      if (data.success !== true) {
        console.log(
          "[FuegoCine] API success=false"
        );

        return [];
      }

      if (!Array.isArray(data.streams)) {
        console.log(
          "[FuegoCine] No hay streams"
        );

        return [];
      }

      console.log(
        "[FuegoCine] Streams encontrados:",
        data.streams.length
      );

      console.log(
  "[FuegoCine] DATOS:",
  JSON.stringify(data.streams)
);
      

      return data.streams
        .filter(function(stream) {
          return (
            stream &&
            stream.servidor_url
          );
        })
        .map(function(stream) {
          var streamUrl =
            String(
              stream.servidor_url
            ).trim();

          var server =
            stream.servidor_nombre ||
            "Modlyo";

          var quality =
            getQuality(
              stream.calidad
            );

          var language =
            getLanguage(
              stream.idioma
            );

          var result = {
            name: "FuegoCine",

            title:
              server +
              " • " +
              quality +
              " • " +
              language,

            url: streamUrl,

            quality: quality,

            provider: server,

            language: language
          };

          /*
           * Solamente añadimos headers cuando
           * parecen necesarios para reproducción.
           */
          if (
            isPlayableUrl(streamUrl)
          ) {
            result.headers = {
              "User-Agent":
                "Mozilla/5.0 (Linux; Android 10; TV) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
              "Referer":
                "https://www.modlyo.com/"
            };
          }

          return result;
        });
    })
    .catch(function(error) {
      console.error(
        "[FuegoCine] Error:",
        error &&
        error.message
          ? error.message
          : String(error)
      );

      return [];
    });
}

module.exports = {
  getStreams: getStreams
};
