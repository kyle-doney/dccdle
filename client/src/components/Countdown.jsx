// Countdown.jsx - Displays a live countdown to the next daily character release.
// The new character drops at 6:00 PM EDT (22:00 UTC) every day.
// Updates every second via setInterval.

import { useState, useEffect } from "react";

// New character releases at 6pm EDT = 22:00 UTC
const RELEASE_HOUR_UTC = 22;

/**
 * getNextReleaseMs
 *
 * Calculates how many milliseconds remain until the next 6pm EDT release.
 * If it's already past 6pm EDT today, targets tomorrow's release instead.
 *
 * @returns {number} Milliseconds until the next release
 */
function getNextReleaseMs() {
  const now = new Date();

  // Build a Date for today's release time in UTC
  const release = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    RELEASE_HOUR_UTC, 0, 0, 0
  ));

  // If we've already passed today's release, target tomorrow's
  if (now >= release) {
    release.setUTCDate(release.getUTCDate() + 1);
  }

  return release - now;
}

/**
 * formatCountdown
 *
 * Converts a millisecond duration into a HH:MM:SS string.
 *
 * @param {number} ms - Remaining milliseconds
 * @returns {string} e.g. "03:47:22"
 */
function formatCountdown(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours   = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Pad each part to two digits so the width doesn't jump around
  return [hours, minutes, seconds]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}

/**
 * Countdown
 *
 * Renders a live HH:MM:SS countdown to the next 6pm EDT character release.
 * Ticks every second. Shows "New character available!" once the timer hits zero.
 */
export default function Countdown() {
  const [msLeft, setMsLeft] = useState(getNextReleaseMs);

  useEffect(() => {
    // Recalculate every second so the display stays accurate
    const timer = setInterval(() => {
      setMsLeft(getNextReleaseMs());
    }, 1000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="mt-4 text-center">
      <p className="font-mono text-dungeon-muted text-xs uppercase tracking-widest mb-1">
        Next character in
      </p>
      {msLeft > 0 ? (
        <p className="font-mono text-dungeon-gold text-2xl tracking-widest">
          {formatCountdown(msLeft)}
        </p>
      ) : (
        <p className="font-mono text-dungeon-correct text-sm tracking-wide">
          New character available!
        </p>
      )}
    </div>
  );
}
