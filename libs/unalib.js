"use strict";

function escapeHtml(str = "") {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function is_http_url(url) {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function stripDangerousTokens(str = "") {
  let s = String(str);

  s = s.replace(/\bon\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "");
  s = s.replace(/javascript\s*:/gi, "");
  s = s.replace(/vbscript\s*:/gi, "");
  s = s.replace(/\bdata\s*:/gi, "data-");

  return s;
}

function is_valid_phone(phone) {
  return typeof phone === "string" && /^[0-9]{4}-[0-9]{4}$/.test(phone);
}

const IMG_EXT = /\.(png|jpe?g|gif|webp|svg|bmp)(\?.*)?$/i;
function is_valid_url_image(url) {
  if (typeof url !== "string") return false;
  if (!is_http_url(url)) return false;
  return IMG_EXT.test(url);
}

function extract_youtube_id(url) {
  try {
    const u = new URL(url);

    if (u.hostname === "youtu.be") return u.pathname.slice(1);

    if (
      u.hostname.endsWith("youtube.com") ||
      u.hostname.endsWith("youtube-nocookie.com")
    ) {
      if (u.pathname === "/watch") return u.searchParams.get("v") || "";
      if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2] || "";
      if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || "";
      if (u.pathname.startsWith("/v/")) return u.pathname.split("/")[2] || "";
    }
    return "";
  } catch {
    return "";
  }
}

function is_valid_yt_video(url) {
  if (typeof url !== "string") return false;
  if (!is_http_url(url)) return false;
  const id = extract_youtube_id(url);
  return typeof id === "string" && id.length > 0;
}

function getYTVideoId(url) { return extract_youtube_id(url); }
function getEmbeddedCode(url) {
  const id = getYTVideoId(url);
  const safeId = escapeHtml(id);
  return (
    '<iframe width="560" height="315" src="https://www.youtube.com/embed/' +
    safeId +
    '" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>'
  );
}
function getImageTag(url) {
  const safeUrl = escapeHtml(url);
  return '<img src="' + safeUrl + '" style="max-height: 400px;max-width: 400px;">';
}

const VID_FILE_EXT = /\.(mp4|webm|ogg)(\?.*)?$/i;

function validateMessage(msg) {
  let obj = null;

  if (msg == null) {
    return JSON.stringify({ mensaje: { kind: "text", text: "" } });
  }

  if (typeof msg === "string") {
    try { obj = JSON.parse(msg); }
    catch { obj = { mensaje: msg }; }
  } else if (typeof msg === "object") {
    obj = { ...msg };
  } else {
    return JSON.stringify({ mensaje: { kind: "text", text: "" } });
  }

  const raw = (obj.mensaje ?? "").toString().trim();
  const lower = raw.toLowerCase();

  // Bloqueos rápidos: si contiene algo sospechoso, lo convertimos en texto
  const BAD = ["<script", "javascript:", "vbscript:", "onerror=", "onload=", "<iframe", "<svg"];
  if (BAD.some((p) => lower.includes(p))) {
    const cleaned = stripDangerousTokens(raw);
    obj.mensaje = { kind: "text", text: escapeHtml(cleaned) };
    return JSON.stringify(obj);
  }

  // Si es URL http(s), clasificar
  if (is_http_url(raw)) {
    if (is_valid_url_image(raw)) {
      obj.mensaje = { kind: "image", url: raw };
      return JSON.stringify(obj);
    }
    if (VID_FILE_EXT.test(raw)) {
      obj.mensaje = { kind: "video", url: raw, provider: "file" };
      return JSON.stringify(obj);
    }
    if (is_valid_yt_video(raw)) {
      const id = extract_youtube_id(raw);
      obj.mensaje = {
        kind: "video",
        url: "https://www.youtube.com/embed/" + id,
        provider: "youtube"
      };
      return JSON.stringify(obj);
    }
  }

  // Texto plano seguro (si no es URL válida)
  const cleaned = stripDangerousTokens(raw);
  obj.mensaje = { kind: "text", text: escapeHtml(cleaned) };
  return JSON.stringify(obj);
}


module.exports = {

  is_valid_phone,
  is_valid_url_image,
  is_valid_yt_video,
  getYTVideoId,
  getEmbeddedCode,
  getImageTag,
  validateMessage,
  extract_youtube_id,
  escapeHtml,
  stripDangerousTokens
};
