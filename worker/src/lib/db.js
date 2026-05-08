// db.js - Database query functions for the D1 (SQLite) database.
// All SQL lives here so the route handlers stay clean and don't have
// raw queries scattered throughout the codebase.

// Reusable SELECT that joins all four tables to build a full character object.
// GROUP_CONCAT collects the one-to-many rows (races, roles, affiliations) into
// comma-separated strings so we only need one query instead of N+1 queries.
const CHARACTER_QUERY = `
  SELECT
    c.id,
    c.name,
    c.origin,
    c.book_intro,
    c.image_url,
    GROUP_CONCAT(DISTINCT cr.race)        AS races,
    GROUP_CONCAT(DISTINCT cro.role)       AS roles,
    GROUP_CONCAT(DISTINCT ca.affiliation) AS affiliations
  FROM characters c
  LEFT JOIN character_races        cr  ON cr.character_id  = c.id
  LEFT JOIN character_roles        cro ON cro.character_id = c.id
  LEFT JOIN character_affiliations ca  ON ca.character_id  = c.id
`;

/**
 * parseCharacter
 *
 * Converts a raw D1 result row into a clean character object.
 * Splits the GROUP_CONCAT strings back into arrays and handles the
 * case where a character has no entries in a join table (null → []).
 *
 * @param {Object} row - Raw row from the D1 query result
 * @returns {Object} Parsed character with array fields for race/role/affiliation
 */
function parseCharacter(row) {
  return {
    id:          row.id,
    name:        row.name,
    origin:      row.origin,
    book_intro:  row.book_intro,
    image_url:   row.image_url,
    race:        row.races        ? row.races.split(",")        : [],
    role:        row.roles        ? row.roles.split(",")        : [],
    affiliation: row.affiliations ? row.affiliations.split(",") : [],
  };
}

/**
 * getAllCharacters
 *
 * Fetches every character from the database, sorted alphabetically by name.
 * Used to populate the frontend autocomplete dropdown.
 *
 * @param {D1Database} db - The D1 database binding from the Worker environment
 * @returns {Promise<Object[]>} Array of parsed character objects
 */
export async function getAllCharacters(db) {
  const { results } = await db
    .prepare(`${CHARACTER_QUERY} GROUP BY c.id ORDER BY c.name`)
    .all();
  return results.map(parseCharacter);
}

/**
 * getCharacterById
 *
 * Looks up a single character by their ID.
 * Used when processing a guess — we need the full character data to compare.
 *
 * @param {D1Database} db - The D1 database binding
 * @param {number}     id - The character's primary key
 * @returns {Promise<Object|null>} The parsed character, or null if not found
 */
export async function getCharacterById(db, id) {
  const { results } = await db
    .prepare(`${CHARACTER_QUERY} WHERE c.id = ? GROUP BY c.id`)
    .bind(id)
    .all();
  return results[0] ? parseCharacter(results[0]) : null;
}

/**
 * getAllCharactersById
 *
 * Fetches every character sorted by ID (not name).
 * Used by the daily puzzle picker so the order is stable and deterministic —
 * sorting by ID means adding new characters at the end doesn't reshuffle past puzzles.
 *
 * @param {D1Database} db - The D1 database binding
 * @returns {Promise<Object[]>} Array of parsed character objects ordered by ID
 */
export async function getAllCharactersById(db) {
  const { results } = await db
    .prepare(`${CHARACTER_QUERY} GROUP BY c.id ORDER BY c.id`)
    .all();
  return results.map(parseCharacter);
}
