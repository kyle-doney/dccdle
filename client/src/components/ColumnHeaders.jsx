// ColumnHeaders.jsx - The header row that labels each column in the guess grid.
// Exports GRID_COLS so GuessRow can use the exact same grid template
// and everything lines up perfectly.

// The display labels shown above each column — order must match GuessRow's COLUMNS array
const COLUMNS = ["Name", "Race", "Role", "Origin", "Affiliation", "Book"];

// CSS grid-template-columns string shared with GuessRow so headers and data stay aligned.
// Each width is hand-tuned to fit typical values without wrapping.
export const GRID_COLS = "160px 120px 120px 110px 160px 70px";

/**
 * ColumnHeaders
 *
 * Renders the labeled header row above the guess grid.
 * No props — the column list is static and defined above.
 */
export default function ColumnHeaders() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: "8px" }}>
      {COLUMNS.map((col) => (
        <div
          key={col}
          className="text-center text-xs uppercase tracking-widest font-mono text-dungeon-gold opacity-80"
        >
          {col}
        </div>
      ))}
    </div>
  );
}
