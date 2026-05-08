// daily.js - GET /api/daily
// Returns puzzle metadata (date and puzzle number).
// Accepts an optional ?date=YYYY-MM-DD query param for archive mode.
// The actual answer character is intentionally NOT returned here —
// comparison happens server-side in the guess route so the answer
// is never exposed to the client.

import { getAllCharactersById } from "../lib/db.js";

/**
 * getDailyCharacter
 *
 * Determines the answer character for a given date using a date-based index.
 * Converts the date (YYYYMMDD) to an integer and mods by the character count
 * to get a stable index. Sorting by ID keeps the sequence stable
 * even as new characters are added later.
 *
 * @param {D1Database}  db   - The D1 database binding
 * @param {string|null} date - YYYY-MM-DD to look up; defaults to today
 * @returns {Promise<Object>} The answer character for that date
 */
export async function getDailyCharacter(db, date = null) {
  const characters = await getAllCharactersById(db);
  const targetDate = date || new Date().toISOString().slice(0, 10);
  // Remove dashes to get a plain integer (e.g. "2026-05-08" → 20260508),
  // then wrap around the character list with modulo
  const index = parseInt(targetDate.replace(/-/g, ""), 10) % characters.length;
  return characters[index];
}

/**
 * handleDaily
 *
 * Hono route handler for GET /api/daily.
 * Accepts an optional ?date=YYYY-MM-DD query param for archive puzzles.
 * Returns the date and puzzle number — not the answer.
 *
 * @param {import("hono").Context} c - Hono request context
 * @returns {Response} JSON with { date, puzzleNumber }
 */
export async function handleDaily(c) {
  try {
    const dateParam = c.req.query("date") || null;

    // Reject malformed date strings before they reach the database
    if (dateParam && !/^\d{4}-\d{2}-\d{2}$/.test(dateParam)) {
      return c.json({ error: "Invalid date format — expected YYYY-MM-DD" }, 400);
    }

    const targetDate = dateParam || new Date().toISOString().slice(0, 10);

    // Count characters to compute the puzzle number the same way getDailyCharacter does
    const { results } = await c.env.DB.prepare("SELECT COUNT(*) AS count FROM characters").all();
    const count = results[0].count;
    const puzzleNumber = parseInt(targetDate.replace(/-/g, ""), 10) % count;

    return c.json({ date: targetDate, puzzleNumber });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to get daily info" }, 500);
  }
}
