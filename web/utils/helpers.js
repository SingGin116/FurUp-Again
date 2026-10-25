import { THEME_KEY } from "./constants.js";

export function getInitialTheme() {
  if (typeof localStorage === "undefined") return "light";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark") return stored;

  
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return "dark";
  }

  return "light";
}

export function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(THEME_KEY, theme);
  }
}

export function smoothScroll(target) {
  const el = document.querySelector(target);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
}

export function formatNumber(value, locale = 'zh-CN') {
  if (value == null || Number.isNaN(value)) return "";

  
  if (locale === 'en-US') {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    }
    if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  
  if (value >= 10000) {
    return (value / 10000).toFixed(1) + 'w';
  }
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getSafeExternalUrl(url) {
  if (!url) return null;
  try {
    const base = typeof location !== "undefined" ? location.href : "http://localhost/";
    const parsed = new URL(String(url), base);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return parsed.href;
  } catch (e) {
    return null;
  }
}

export function sanitizeHtml(html) {
  if (!html) return "";
  if (typeof DOMParser === "undefined") return escapeHtml(html);
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(html), "text/html");
  const allowedTags = new Set([
    "a",
    "abbr",
    "b",
    "blockquote",
    "br",
    "code",
    "div",
    "em",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "hr",
    "img",
    "li",
    "ol",
    "p",
    "pre",
    "span",
    "strong",
    "ul",
  ]);
  const blockedTags = new Set([
    "base",
    "embed",
    "iframe",
    "link",
    "meta",
    "object",
    "script",
    "style",
  ]);
  const allowedAttrs = new Set([
    "alt",
    "class",
    "href",
    "loading",
    "rel",
    "src",
    "target",
    "title",
    "width",
    "height",
  ]);
  const allowedProtocols = new Set(["http:", "https:", "mailto:", "tel:"]);
  const base = typeof location !== "undefined" ? location.href : "http://localhost/";
  const elements = Array.from(doc.body ? doc.body.querySelectorAll("*") : []);

  for (const el of elements) {
    const tag = el.tagName.toLowerCase();
    if (blockedTags.has(tag)) {
      el.remove();
      continue;
    }
    if (!allowedTags.has(tag)) {
      const parent = el.parentNode;
      if (!parent) continue;
      while (el.firstChild) {
        parent.insertBefore(el.firstChild, el);
      }
      parent.removeChild(el);
      continue;
    }

    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on")) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (!allowedAttrs.has(name)) {
        el.removeAttribute(attr.name);
        continue;
      }
      if (name === "href" || name === "src") {
        const value = String(attr.value || "").trim();
        let safeUrl = null;
        if (name === "src" && tag === "img" && /^data:image\//i.test(value)) {
          safeUrl = value;
        } else {
          try {
            const parsed = new URL(value, base);
            if (allowedProtocols.has(parsed.protocol)) {
              safeUrl = parsed.href;
            }
          } catch (e) {
            safeUrl = null;
          }
        }
        if (!safeUrl) {
          el.removeAttribute(attr.name);
          continue;
        }
        el.setAttribute(attr.name, safeUrl);
      }
      if (name === "target") {
        const target = String(attr.value || "");
        if (target === "_blank") {
          const rel = String(el.getAttribute("rel") || "")
            .split(/\s+/)
            .filter(Boolean);
          if (!rel.includes("noopener")) rel.push("noopener");
          if (!rel.includes("noreferrer")) rel.push("noreferrer");
          el.setAttribute("rel", rel.join(" "));
        } else {
          el.removeAttribute("target");
        }
      }
    }
  }

  return doc.body ? doc.body.innerHTML : "";
}






export async function copyToClipboard(text) {
  
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) {  }

  
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.setAttribute("readonly", "");
    el.style.position = "absolute";
    el.style.left = "-9999px";
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
    return true;
  } catch (e) {
    return false;
  }
}
