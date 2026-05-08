// guess.js - POST /api/guess
// Accepts a character ID (and optionally a date) from the player, fetches the
// answer for that date, compares the two, and returns the result tiles.
// All comparison logic runs server-side so the answer is never sent to the
// client until the player wins.

import { getCharacterById } from "../lib/db.js";
import { getDailyCharacter } from "./daily.js";
import { compareCharacters } from "../lib/compare.js";

/**
 * handleGuess
 *
 * Hono route handler for POST /api/guess.
 * Expects a JSON body with { characterId, date? }.
 * If date is omitted, uses today's puzzle. If provided, uses that date's puzzle
 * so the player can guess against archive puzzles.
 *
 * Fetches both the guessed character and today's answer in parallel for speed,
 * then runs the comparison and returns the result.
 * Only reveals the answer character's name and image if the player won.
 *
 * @param {import("hono").Context} c - Hono request context
 * @returns {Response} JSON with { comparison, won, answer? }
 */
export async function handleGuess(c) {
  const { characterId, date } = await c.req.json();

  if (!characterId) return c.json({ error: "characterId required" }, 400);

  // Validate the date param if one was provided
  if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: "Invalid date format — expected YYYY-MM-DD" }, 400);
  }

  try {
    // Fetch the answer for the target date and the guessed character in parallel
    const [answer, guess] = await Promise.all([
      getDailyCharacter(c.env.DB, date || null),
      getCharacterById(c.env.DB, characterId),
    ]);

    if (!guess) return c.json({ error: "Character not found" }, 404);

    const won = guess.id === answer.id;

    return c.json({
      comparison: compareCharacters(guess, answer),
      won,
      // Only reveal the answer once the player has actually won
      // so we never leak it to someone who's still guessing
      ...(won && { answer: { name: answer.name, image_url: answer.image_url } }),
    });
  } catch (err) {
    console.error(err);
    return c.json({ error: "Guess failed" }, 500);
  }
}
