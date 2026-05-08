// GuessRow.jsx - One full row in the guess grid, one tile per attribute.
// Uses the same GRID_COLS value as ColumnHeaders so everything lines up.

import ResultTile from "./ResultTile.jsx";
import { GRID_COLS } from "./ColumnHeaders.jsx";

// All six columns in display order.
// key maps to the field name in the comparison object returned by the server.
const COLUMNS = [
  { key: "name",        label: "Name"        },
  { key: "race",        label: "Race"        },
  { key: "role",        label: "Role"        },
  { key: "origin",      label: "Origin"      },
  { key: "affiliation", label: "Affiliation" },
  { key: "book_intro",  label: "Book"        },
];

/**
 * GuessRow
 *
 * Renders a single row of result tiles for one guess.
 * Each tile flips in with a staggered delay (120ms per tile) so they
 * reveal left-to-right instead of all at once.
 *
 * @param {Object}  comparison - The comparison object from the server ({ name, race, role, ... })
 * @param {boolean} won        - True if this is the winning guess (turns the name tile green)
 */
export default function GuessRow({ comparison, won }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: GRID_COLS, gap: "8px" }}>
      {COLUMNS.map((col, i) => {
        const data = comparison[col.key];

        // The name tile doesn't get a result from the server (it's just the character name).
        // We color it green if this row is the winning guess, otherwise it stays neutral.
        const result = col.key === "name"
          ? (won ? "correct" : "neutral")
          : data?.result;

        return (
          <ResultTile
            key={col.key}
            label={col.label}
            value={data?.value ?? "—"}
            result={result}
            animationDelay={i * 120} // stagger each tile by 120ms
          />
        );
      })}
    </div>
  );
}
