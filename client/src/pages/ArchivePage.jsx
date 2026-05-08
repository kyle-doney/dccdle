// ArchivePage.jsx - Lists all past puzzle dates and lets the player replay them.
// Checks localStorage for each date to show a completion badge if already played.
//
// UPDATE LAUNCH_DATE to the actual date the game went live.

// ── Constants ────────────────────────────────────────────────────────────────

// The first date that had a puzzle. Change this to your real launch date.
const LAUNCH_DATE = "2026-05-01";

// New character releases at 6pm EDT = 22:00 UTC
const RELEASE_HOUR_UTC = 22;

// ── Helpers ──────────────────────────────────────────────────────────────────

/**
 * getPastPuzzleDates
 *
 * Returns all puzzle dates from LAUNCH_DATE up to (but not including) today's
 * active puzzle, most recent first. A date is "past" once its 6pm EDT window
 * has closed, so today only appears once the next release fires.
 *
 * @returns {string[]} Array of YYYY-MM-DD strings, newest first
 */
function getPastPuzzleDates() {
  const now = new Date();

  // Figure out the cutoff: today's release time in UTC
  const todayRelease = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(),
    RELEASE_HOUR_UTC, 0, 0, 0
  ));

  // The "current" puzzle date: today if past release, yesterday if not
  const currentPuzzleDate = now >= todayRelease
    ? now.toISOString().slice(0, 10)
    : new Date(now.getTime() - 86400000).toISOString().slice(0, 10);

  const dates = [];
  const cursor = new Date(LAUNCH_DATE + "T00:00:00Z");
  const cutoff = new Date(currentPuzzleDate + "T00:00:00Z");

  // Walk from launch date up to (but not including) the current puzzle date
  while (cursor < cutoff) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return dates.reverse(); // most recent at the top
}

/**
 * formatDate
 *
 * Formats a YYYY-MM-DD string as a human-readable date like "May 7, 2026".
 *
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {string}
 */
function formatDate(dateStr) {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

/**
 * getArchiveResult
 *
 * Reads localStorage for a specific archive date to check if the player
 * has already completed that puzzle.
 *
 * @param {string} date - YYYY-MM-DD
 * @returns {{ won: boolean, guessCount: number } | null}
 */
function getArchiveResult(date) {
  try {
    const stored = localStorage.getItem(`dccdle-archive-${date}`);
    if (!stored) return null;
    const state = JSON.parse(stored);
    // Make sure the stored state actually belongs to this date
    if (state.date !== date) return null;
    return { won: state.won, guessCount: state.guesses?.length ?? 0 };
  } catch {
    return null;
  }
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * ArchivePage
 *
 * Shows all past puzzle dates with play buttons and completion badges.
 * Calls navigate("play/YYYY-MM-DD") when the player picks a date.
 *
 * @param {{ navigate: Function }} props
 */
export default function ArchivePage({ navigate }) {
  const dates = getPastPuzzleDates();

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="text-center mb-8 w-full max-w-2xl">
        {/* Back button to today's game */}
        <button
          onClick={() => navigate("")}
          className="absolute left-4 top-8 font-mono text-dungeon-muted text-sm
                     hover:text-dungeon-gold transition-colors uppercase tracking-widest"
        >
          ← Today
        </button>

        <h1 className="font-display text-4xl sm:text-5xl text-dungeon-gold tracking-widest mb-1">
          Archive
        </h1>
        <p className="font-body text-dungeon-muted text-lg italic">
          Revisit past Dungeon Crawler Carl puzzles
        </p>
        <div className="mt-3 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-dungeon-gold to-transparent" />
      </header>

      {/* ── Puzzle List ────────────────────────────────────────────── */}
      <div className="w-full max-w-2xl space-y-2">
        {dates.length === 0 ? (
          // No archive entries yet — only shows on day one
          <p className="text-center text-dungeon-muted font-mono text-sm mt-12">
            No archive puzzles yet. Check back tomorrow!
          </p>
        ) : (
          dates.map((date) => {
            const result = getArchiveResult(date);
            return (
              <div
                key={date}
                className="flex items-center justify-between bg-dungeon-surface border
                           border-dungeon-border rounded-lg px-4 py-3"
              >
                {/* Date label */}
                <span className="font-mono text-dungeon-text text-sm">
                  {formatDate(date)}
                </span>

                <div className="flex items-center gap-3">
                  {/* Completion badge — only shown if the player has played this date */}
                  {result && (
                    <span className={`font-mono text-xs uppercase tracking-widest
                      ${result.won ? "text-dungeon-correct" : "text-dungeon-muted"}`}>
                      {result.won ? `✓ ${result.guessCount} ${result.guessCount === 1 ? "guess" : "guesses"}` : "✗ failed"}
                    </span>
                  )}

                  {/* Play button */}
                  <button
                    onClick={() => navigate(`play/${date}`)}
                    className="font-mono text-xs uppercase tracking-widest px-3 py-1.5
                               border border-dungeon-gold text-dungeon-gold rounded
                               hover:bg-dungeon-gold hover:text-dungeon-bg transition-colors"
                  >
                    {result ? "Replay" : "Play"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="mt-auto pt-12 text-dungeon-muted font-mono text-xs text-center opacity-50">
        A new character every day at 6pm EDT
      </footer>
    </div>
  );
}
