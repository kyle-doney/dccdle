// useRouter.js - Lightweight hash-based client-side router.
// No library needed — we just listen to the hashchange event and parse the URL.
//
// Supported routes:
//   #/          → today's game (home)
//   #/archive   → archive list
//   #/play/YYYY-MM-DD → play a specific past puzzle

import { useState, useEffect } from "react";

/**
 * parseHash
 *
 * Reads window.location.hash and returns a route object.
 * Falls back to { page: "home" } for any unrecognized hash.
 *
 * @returns {{ page: string, date?: string }}
 */
function parseHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");

  if (!hash) return { page: "home" };
  if (hash === "archive") return { page: "archive" };

  // Match #/play/YYYY-MM-DD
  const match = hash.match(/^play\/(\d{4}-\d{2}-\d{2})$/);
  if (match) return { page: "play", date: match[1] };

  return { page: "home" };
}

/**
 * useRouter
 *
 * Returns the current route and a navigate function.
 * Updates automatically when the URL hash changes.
 *
 * @returns {{ route: Object, navigate: Function }}
 */
export function useRouter() {
  const [route, setRoute] = useState(parseHash);

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  /**
   * navigate
   *
   * Changes the URL hash, which triggers a hashchange event and re-renders.
   *
   * @param {string} path - e.g. "archive" or "play/2026-05-01"
   */
  function navigate(path) {
    window.location.hash = path;
  }

  return { route, navigate };
}
