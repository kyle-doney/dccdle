// ShareButton.jsx - Copies the player's emoji result grid to the clipboard.
// Shows "SHARE" normally, briefly changes to "COPIED!" on success,
// then resets automatically. No alert dialogs — everything is inline.

import { useState } from "react";

// Maps server result types to the emoji shown in the share text
const EMOJI = {
  correct:   "🟩",
  partial:   "🟨",
  incorrect: "🟥",
  higher:    "⬆️",
  lower:     "⬇️",
};

// Only these five columns are included in the shareable emoji grid.
// Name is excluded because it would spoil the answer for other players.
const SHARE_COLUMNS = ["race", "role", "origin", "affiliation", "book_intro"];

/**
 * buildShareText
 *
 * Builds the multi-line text that gets copied to the clipboard.
 * Produces a header line, one emoji row per guess, a summary line, and the URL.
 *
 * @param {Object[]} guesses      - The player's full guess history
 * @param {number}   guessCount   - How many guesses it took
 * @param {number}   puzzleNumber - Today's puzzle number (shown in the header)
 * @returns {string} The full shareable text block
 */
function buildShareText(guesses, guessCount, puzzleNumber) {
  // Convert each guess into a row of emoji based on the comparison results
  const rows = guesses.map((g) =>
    SHARE_COLUMNS
      .map((col) => EMOJI[g.comparison[col]?.result] ?? "🟥") // default to red if missing
      .join("")
  );

  return [
    `DCCdle #${puzzleNumber} 🔥${guessCount}`,
    ...rows,
    `Solved in ${guessCount} ${guessCount === 1 ? "guess" : "guesses"}!`,
    "https://dccdle.com",
  ].join("\n");
}

/**
 * ShareButton
 *
 * Button that copies the emoji result grid to the clipboard when clicked.
 * Briefly shows "COPIED!" then resets to "SHARE" after 500ms.
 * Falls back to the deprecated execCommand approach if the Clipboard API
 * isn't available (e.g. older browsers or non-HTTPS contexts).
 *
 * @param {Object[]} guesses      - Full guess history from useGame
 * @param {number}   guessCount   - Number of guesses taken
 * @param {number}   puzzleNumber - Today's puzzle number
 */
export default function ShareButton({ guesses, guessCount, puzzleNumber }) {
  const [copied, setCopied] = useState(false); // controls the "COPIED!" flash

  /**
   * handleShare
   *
   * Builds the share text and writes it to the clipboard.
   * Tries the modern Clipboard API first; falls back to a hidden textarea + execCommand
   * for environments where navigator.clipboard isn't available.
   */
  async function handleShare() {
    const text = buildShareText(guesses, guessCount, puzzleNumber);

    try {
      // Modern approach — works in most browsers on HTTPS
      await navigator.clipboard.writeText(text);
    } catch {
      // Fallback: create a hidden textarea, select it, and use the old copy command
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
    }

    // Flash "COPIED!" for half a second so the player knows it worked
    setCopied(true);
    setTimeout(() => setCopied(false), 500);
  }

  return (
    <button
      onClick={handleShare}
      className="mt-4 px-6 py-2.5 bg-dungeon-gold text-dungeon-bg font-display
                 text-sm tracking-widest uppercase rounded-lg hover:brightness-110
                 transition-all active:scale-95"
    >
      {copied ? "COPIED!" : "SHARE"}
    </button>
  );
}
