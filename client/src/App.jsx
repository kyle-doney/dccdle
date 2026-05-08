// App.jsx - Root component. Handles routing and renders the correct page.
// Uses a lightweight hash-based router — no library required.
//
// Routes:
//   #/                   → today's puzzle (GamePage, targetDate = null)
//   #/archive            → ArchivePage
//   #/play/YYYY-MM-DD    → GamePage for a past puzzle

import { useGame } from "./hooks/useGame.js";
import { useRouter } from "./hooks/useRouter.js";
import GuessInput from "./components/GuessInput.jsx";
import GuessRow from "./components/GuessRow.jsx";
import ColumnHeaders from "./components/ColumnHeaders.jsx";
import ShareButton from "./components/ShareButton.jsx";
import Countdown from "./components/Countdown.jsx";
import ArchivePage from "./pages/ArchivePage.jsx";

/**
 * App
 *
 * Top-level router component. Reads the URL hash and renders either
 * the ArchivePage or the GamePage. Passes a key to GamePage so React
 * fully remounts it when switching between puzzles (clears all hook state).
 */
export default function App() {
  const { route, navigate } = useRouter();

  if (route.page === "archive") {
    return <ArchivePage navigate={navigate} />;
  }

  // null for today's game, or a YYYY-MM-DD string for an archive puzzle
  const targetDate = route.page === "play" ? route.date : null;

  // The key forces a full remount when targetDate changes so hook state doesn't bleed
  // between puzzles (e.g. navigating from one archive date to another)
  return <GamePage key={targetDate ?? "today"} targetDate={targetDate} navigate={navigate} />;
}

/**
 * GamePage
 *
 * Renders the full game UI for either today's puzzle or a specific archive date.
 * All game logic comes from the useGame hook.
 *
 * @param {string|null} targetDate - YYYY-MM-DD for archive mode, null for today
 * @param {Function}    navigate   - Router navigate function
 */
function GamePage({ targetDate, navigate }) {
  const {
    availableCharacters, guesses, won, loading, error,
    guess, guessCount, puzzleNumber, isArchive,
  } = useGame(targetDate);

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8">

      {/* ── Header ─────────────────────────────────────────────────── */}
      <header className="text-center mb-8 relative w-full max-w-4xl">
        {/* Archive nav link — shown in the top-right corner */}
        {!isArchive && (
          <button
            onClick={() => navigate("archive")}
            className="absolute right-0 top-1 font-mono text-dungeon-muted text-xs
                       uppercase tracking-widest hover:text-dungeon-gold transition-colors"
          >
            Archive
          </button>
        )}

        {/* Back button when playing an archive puzzle */}
        {isArchive && (
          <button
            onClick={() => navigate("archive")}
            className="absolute left-0 top-1 font-mono text-dungeon-muted text-xs
                       uppercase tracking-widest hover:text-dungeon-gold transition-colors"
          >
            ← Archive
          </button>
        )}

        <h1 className="font-display text-4xl sm:text-5xl text-dungeon-gold tracking-widest mb-1">
          DCCDLE
        </h1>

        {/* Show the archive date instead of the tagline when replaying a past puzzle */}
        {isArchive ? (
          <p className="font-mono text-dungeon-amber text-sm uppercase tracking-widest">
            {new Date(targetDate + "T00:00:00").toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        ) : (
          <p className="font-body text-dungeon-muted text-lg italic">
            Guess today's Dungeon Crawler Carl character
          </p>
        )}

        {/* Decorative gold divider line */}
        <div className="mt-3 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-dungeon-gold to-transparent" />
      </header>

      {/* ── Color Legend ───────────────────────────────────────────── */}
      {/* Shows the player what each tile color/symbol means before they start */}
      <div className="flex gap-4 mb-6 text-sm font-mono flex-wrap justify-center">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-dungeon-correct inline-block" />
          <span className="text-dungeon-muted">Correct</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-dungeon-partial inline-block" />
          <span className="text-dungeon-muted">Partial</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-dungeon-wrong border border-dungeon-border inline-block" />
          <span className="text-dungeon-muted">Wrong</span>
        </span>
        <span className="flex items-center gap-1.5">
          {/* Arrows are used for the Book number — higher or lower than the answer */}
          <span className="text-dungeon-amber">▲▼</span>
          <span className="text-dungeon-muted">Book direction</span>
        </span>
      </div>

      {/* ── Guess Input ────────────────────────────────────────────── */}
      {/* Hidden entirely once the player wins */}
      {!won && (
        <div className="w-full max-w-2xl mb-8">
          <GuessInput characters={availableCharacters} onGuess={guess} disabled={loading} />
        </div>
      )}

      {/* ── Status Messages ────────────────────────────────────────── */}
      {error && <p className="text-red-400 font-mono text-sm mb-4">{error}</p>}
      {loading && <p className="text-dungeon-muted font-mono text-sm animate-pulse">Entering the dungeon...</p>}

      {/* ── Guess Grid ─────────────────────────────────────────────── */}
      {/* Only shown once the player has made at least one guess */}
      {guesses.length > 0 && (
        <div className="w-full max-w-4xl space-y-2">
          <ColumnHeaders />
          {guesses.map((g, i) => (
            <GuessRow
              key={i}
              comparison={g.comparison}
              /* Pass won=true only to the final row so it highlights green */
              won={won && i === guesses.length - 1}
            />
          ))}
        </div>
      )}

      {/* ── Win Box ────────────────────────────────────────────────── */}
      {/* Appears below the guess grid after the player identifies the character */}
      {won && (
        <div className="gold-glow border border-dungeon-gold rounded-lg px-6 py-4 mt-6
                        text-center bg-dungeon-surface flex flex-col items-center">
          <p className="font-display text-dungeon-gold text-xl mb-1">The Syndicate Approves</p>
          <p className="font-mono text-dungeon-muted uppercase tracking-widest text-sm">
            Identified in {guessCount} {guessCount === 1 ? "guess" : "guesses"}!
          </p>

          {/* Share button lets the player copy their emoji grid to clipboard */}
          <ShareButton
            guesses={guesses}
            guessCount={guessCount}
            puzzleNumber={puzzleNumber}
          />

          {/* Only show the countdown on today's puzzle — archive puzzles don't have a "next" */}
          {!isArchive && <Countdown />}

          {/* On archive puzzles, offer a link back to the archive list */}
          {isArchive && (
            <button
              onClick={() => navigate("archive")}
              className="mt-4 font-mono text-dungeon-muted text-xs uppercase tracking-widest
                         hover:text-dungeon-gold transition-colors"
            >
              ← Back to Archive
            </button>
          )}
        </div>
      )}

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <footer className="mt-auto pt-12 text-dungeon-muted font-mono text-xs text-center opacity-50">
        A new character every day at 6pm EDT
      </footer>
    </div>
  );
}
