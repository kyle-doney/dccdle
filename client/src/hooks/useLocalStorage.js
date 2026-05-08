// useLocalStorage.js - A simple hook that syncs a piece of React state
// with localStorage so it survives page refreshes.
// Works just like useState but reads/writes to localStorage automatically.

import { useState, useEffect } from "react";

/**
 * useLocalStorage
 *
 * Drop-in replacement for useState that persists the value in localStorage.
 * Reads the stored value on first render; falls back to initialValue if nothing
 * is stored yet or if JSON.parse fails (e.g. corrupted data).
 *
 * @param {string} key          - The localStorage key to read/write
 * @param {*}      initialValue - Default value if nothing is stored yet
 * @returns {[*, Function]}     - Same [value, setter] tuple as useState
 */
export function useLocalStorage(key, initialValue) {
  // Initialize state by reading from localStorage.
  // The function form of useState only runs once on mount.
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      // If nothing is stored yet, use the default value
      return stored ? JSON.parse(stored) : initialValue;
    } catch {
      // If localStorage is unavailable or the JSON is broken, just use the default
      return initialValue;
    }
  });

  // Every time value changes, write the new value back to localStorage
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  // Return the same [value, setter] interface as regular useState
  return [value, setValue];
}
