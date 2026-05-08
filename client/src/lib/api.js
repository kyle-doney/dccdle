// api.js - All HTTP calls to the Cloudflare Worker backend live here.
// Keeping fetch logic in one place means if the API URL ever changes,
// we only have to update it in one spot.

// Base URL prefix — Vite proxies /api to the worker in development.
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : "/api";

/**
 * fetchCharacters
 *
 * Retrieves the full list of characters from the database.
 * Used to populate the autocomplete dropdown in GuessInput.
 *
 * @returns {Promise<Object[]>} Array of character objects
 */
export async function fetchCharacters() {
  const res = await fetch(`${BASE}/characters`);
  if (!res.ok) throw new Error("Failed to fetch characters");
  return res.json();
}

/**
 * fetchDaily
 *
 * Gets puzzle metadata (date and puzzle number) for the given date.
 * If no date is provided, the server uses today's date.
 * The actual answer character is never sent — comparison happens on POST /guess.
 *
 * @param {string|null} date - YYYY-MM-DD for archive mode, null for today
 * @returns {Promise<{date: string, puzzleNumber: number}>}
 */
export async function fetchDaily(date = null) {
  const url = date ? `${BASE}/daily?date=${date}` : `${BASE}/daily`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch daily info");
  return res.json();
}

/**
 * submitGuess
 *
 * Posts a character ID (and optionally a date) to the server and gets back
 * a comparison result. The server figures out the correct answer for that
 * date and compares it to the guess.
 *
 * @param {number}      characterId - The ID of the character the player picked
 * @param {string|null} date        - YYYY-MM-DD for archive mode, null for today
 * @returns {Promise<{comparison: Object, won: boolean, answer?: Object}>}
 */
export async function submitGuess(characterId, date = null) {
  const res = await fetch(`${BASE}/guess`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ characterId, ...(date && { date }) }),
  });
  if (!res.ok) throw new Error("Guess failed");
  return res.json();
}
