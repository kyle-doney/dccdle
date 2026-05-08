// characters.js - GET /api/characters
// Returns the full list of characters from the database.
// The frontend uses this to populate the autocomplete search box.

import { getAllCharacters } from "../lib/db.js";

/**
 * handleCharacters
 *
 * Hono route handler for GET /api/characters.
 * Fetches all characters and returns them as JSON.
 * Returns 500 if the database query fails.
 *
 * @param {import("hono").Context} c - Hono request context (env.DB is the D1 binding)
 * @returns {Response} JSON array of character objects
 */
export async function handleCharacters(c) {
  try {
    const characters = await getAllCharacters(c.env.DB);
    return c.json(characters);
  } catch (err) {
    console.error(err);
    return c.json({ error: "Failed to fetch characters" }, 500);
  }
}
