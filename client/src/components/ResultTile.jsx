// ResultTile.jsx - A single cell in the guess grid.
// Shows the guessed value and colors itself based on whether
// it matched the answer (correct/partial/incorrect/higher/lower/neutral).

// Maps each result type to its Tailwind color classes.
// These class names are defined in tailwind.config.js under the "dungeon" theme.
const RESULT_STYLES = {
  correct:   "bg-dungeon-correct border-dungeon-correct text-white",
  partial:   "bg-dungeon-partial border-dungeon-partial text-white",
  incorrect: "bg-dungeon-wrong  border-dungeon-border   text-dungeon-muted",
  higher:    "bg-dungeon-wrong  border-dungeon-border   text-dungeon-text",
  lower:     "bg-dungeon-wrong  border-dungeon-border   text-dungeon-text",
  neutral:   "bg-dungeon-surface border-dungeon-border  text-dungeon-text",
};

// Arrow indicators for the Book column — tells the player which direction to go
const ARROW = { higher: "▲", lower: "▼" };

/**
 * ResultTile
 *
 * Renders one colored tile showing a guessed attribute value and its result.
 * Plays the flip animation on mount (staggered by animationDelay for effect).
 *
 * @param {string}          label          - Column label shown at the top of the tile (e.g. "Race")
 * @param {string|string[]} value          - The guessed value(s) to display
 * @param {string}          result         - One of: correct | partial | incorrect | higher | lower | neutral
 * @param {number}          animationDelay - Milliseconds to wait before starting the flip animation
 */
export default function ResultTile({ label, value, result, animationDelay = 0 }) {
  // Fall back to incorrect styling if we somehow get an unrecognized result type
  const style = RESULT_STYLES[result] ?? RESULT_STYLES.incorrect;

  // If the value is an array (e.g. multiple races), join them with commas for display
  const displayValue = Array.isArray(value) ? value.join(", ") : String(value);

  return (
    <div
      className={`tile-flip flex flex-col items-center justify-center border rounded-md px-2 py-2 min-h-[64px] min-w-[80px] text-center select-none ${style}`}
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Small column label at the top of the tile */}
      <span className="text-xs uppercase tracking-widest font-mono opacity-70 mb-1">{label}</span>

      {/* Main value, with an optional arrow for book number comparison */}
      <span className="font-body text-sm font-semibold leading-tight">
        {displayValue}
        {ARROW[result] && <span className="ml-1 text-dungeon-amber">{ARROW[result]}</span>}
      </span>
    </div>
  );
}
