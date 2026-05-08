// GuessInput.jsx - The character search box with autocomplete dropdown.
// Filters the character roster client-side as the user types and supports
// full keyboard navigation so you never have to reach for the mouse.

import { useState, useRef, useEffect } from "react";

/**
 * GuessInput
 *
 * Autocomplete input for submitting character guesses.
 * Filters the roster client-side as the user types and supports
 * keyboard navigation (arrow keys, Enter, Escape).
 *
 * @param {Object[]} characters - Available characters (already-guessed ones excluded by parent)
 * @param {Function} onGuess    - Called with the selected character object
 * @param {boolean}  disabled   - Locks the input when the puzzle is complete
 */
export default function GuessInput({ characters, onGuess, disabled }) {
  const [query, setQuery] = useState("");         // current text in the input box
  const [open, setOpen] = useState(false);        // whether the dropdown is visible
  const [highlighted, setHighlighted] = useState(0); // which dropdown item is focused
  const inputRef = useRef(null);                  // lets us re-focus after selecting

  // Filter the roster down to names that contain the query (case-insensitive)
  // Cap at 8 results so the dropdown doesn't get too tall
  const results = characters
    .filter((c) => c.name.toLowerCase().includes(query.toLowerCase()))
    .slice(0, 8);

  // Reset highlight to the first item whenever the query changes.
  // This way the first result is always pre-selected without the player
  // having to press the down arrow first.
  useEffect(() => { setHighlighted(0); }, [query]);

  /**
   * select
   *
   * Called when the player picks a character (click or Enter key).
   * Fires the parent callback, clears the input, and closes the dropdown.
   *
   * @param {Object} character - The character the player selected
   */
  function select(character) {
    onGuess(character);
    setQuery("");
    setOpen(false);
    // Put focus back on the input so the player can start typing the next guess
    inputRef.current?.focus();
  }

  /**
   * handleKeyDown
   *
   * Handles arrow key navigation and Enter/Escape when the dropdown is open.
   * Ignores keypresses if the dropdown is closed.
   *
   * @param {KeyboardEvent} e
   */
  function handleKeyDown(e) {
    if (!open) return;

    if (e.key === "ArrowDown") {
      e.preventDefault(); // prevent the page from scrolling
      setHighlighted((h) => Math.min(h + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && results[highlighted]) {
      select(results[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="relative w-full max-w-md mx-auto">

      {/* ── Text Input ─────────────────────────────────────────────── */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        disabled={disabled}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
        onFocus={() => query && setOpen(true)}
        onKeyDown={handleKeyDown}
        // Small delay before closing so the onMouseDown on a list item fires first.
        // Without this, the dropdown closes before the click registers.
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        placeholder={disabled ? "Puzzle complete!" : "Search for a character..."}
        className="w-full bg-dungeon-surface border border-dungeon-border rounded-lg px-4 py-3
                   font-body text-dungeon-text placeholder-dungeon-muted text-lg
                   focus:outline-none focus:border-dungeon-gold transition-colors
                   disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* ── Dropdown List ──────────────────────────────────────────── */}
      {/* Only render when open and there are matching results */}
      {open && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-dungeon-surface border border-dungeon-border
                       rounded-lg overflow-hidden shadow-2xl shadow-black/60">
          {results.map((char, i) => (
            <li
              key={char.id}
              onMouseDown={() => select(char)}
              onMouseEnter={() => setHighlighted(i)} // sync keyboard highlight with mouse
              className={`px-4 py-2.5 cursor-pointer font-body text-base transition-colors
                ${i === highlighted
                  ? "bg-dungeon-gold/20 text-dungeon-gold"  // highlighted item
                  : "text-dungeon-text hover:bg-dungeon-border/40"
                }`}
            >
              {char.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
