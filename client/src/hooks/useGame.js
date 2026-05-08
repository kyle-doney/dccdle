// useGame.js - The core game logic hook.
// Manages all game state: character list, guess history, win condition,
// and persistence across page refreshes via localStorage.
// Accepts an optional targetDate to support archive puzzle playback.

import { useState, useEffect } from "react";
import { fetchCharacters, fetchDaily, submitGuess } from "../lib/api.js";
import { useLocalStorage } from "./useLocalStorage.js";

// The shape of a brand-new game session with no guesses yet.
const FRESH_STATE = { date: null, guesses: [], won: false, guessedIds: [] };

/**
 * today
 *
 * Returns today's date as a YYYY-MM-DD string (UTC).
 *
 * @returns {string} e.g. "2026-05-08"
 */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * useGame
 *
 * Custom hook that wires together API calls, localStorage persistence,
 * and the guess-submission flow.
 *
 * Pass a targetDate to play an archive puzzle for that date.
 * Omit it (or pass null) to play today's puzzle.
 *
 * Each date gets its own localStorage key so archive progress is saved
 * independently from the daily game.
 *
 * @param {string|null} targetDate - YYYY-MM-DD for archive mode, null for today
 * @returns {{
 *   availableCharacters: Object[],
 *   guesses:             Object[],
 *   won:                 boolean,
 *   loading:             boolean,
 *   error:               string|null,
 *   guess:               Function,
 *   guessCount:          number,
 *   puzzleNumber:        number|null,
 *   isArchive:           boolean,
 * }}
 */
export function useGame(targetDate = null) {
  const isArchive = !!targetDate;

  // Use a date-scoped key for archive games so each puzzle saves separately
  const storageKey = isArchive ? `dccdle-archive-${targetDate}` : "dccdle-state";

  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [puzzleNumber, setPuzzleNumber] = useState(null);
  const [savedState, setSavedState] = useLocalStorage(storageKey, FRESH_STATE);

  // The puzzle date we expect the saved state to match
  const expectedDate = targetDate || today();

  // If the saved state belongs to a different date, treat it as a fresh game.
  // For daily puzzles this resets the state when a new day begins.
  const state = savedState.date === expectedDate ? savedState : FRESH_STATE;

  /**
   * updateState
   *
   * Merges a partial update into the saved state and stamps the puzzle date.
   *
   * @param {Object} patch - Fields to merge into the current state
   */
  function updateState(patch) {
    setSavedState((prev) => ({ ...prev, ...patch, date: expectedDate }));
  }

  // Fetch character roster and puzzle metadata on mount (or when targetDate changes).
  // Using targetDate as a dependency ensures the state reloads when the player
  // navigates from one archive puzzle to another.
  useEffect(() => {
    setLoading(true);
    setError(null);

    async function init() {
      try {
        const [chars, daily] = await Promise.all([
          fetchCharacters(),
          fetchDaily(targetDate), // pass date so the server returns the right puzzle number
        ]);
        setCharacters(chars);
        setPuzzleNumber(daily.puzzleNumber);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [targetDate]); // re-run whenever the target date changes

  /**
   * guess
   *
   * Submits a character guess to the server and stores the result.
   * Guards against duplicate guesses and submitting after the game is won.
   *
   * @param {Object} character - Character object from the autocomplete list
   */
  async function guess(character) {
    if (state.won || state.guessedIds.includes(character.id)) return;

    try {
      // Pass the target date so the server compares against the right answer
      const result = await submitGuess(character.id, targetDate);

      updateState({
        guesses: [...state.guesses, { character, ...result }],
        won: result.won,
        guessedIds: [...state.guessedIds, character.id],
        ...(result.won && { answer: result.answer }),
      });
    } catch (err) {
      setError(err.message);
    }
  }

  return {
    characters,
    availableCharacters: characters.filter((c) => !state.guessedIds.includes(c.id)),
    guesses: state.guesses,
    won: state.won,
    loading,
    error,
    guess,
    guessCount: state.guesses.length,
    puzzleNumber,
    isArchive,
  };
}
