// generate-seed.js - Converts characters.json into seed.sql for the D1 database.
// Run this script whenever characters.json changes, then apply seed.sql with wrangler.
// Usage: node migrations/generate-seed.js

import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

// __dirname isn't available in ES modules, so we derive it from import.meta.url
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load the character data from the JSON file one directory up
const characters = JSON.parse(
  readFileSync(join(__dirname, "../characters.json"), "utf-8")
);

// Start by deleting all existing data so re-running this script is safe.
// Child table rows must be deleted before the parent (characters) due to foreign keys.
const lines = [
  "DELETE FROM character_affiliations;",
  "DELETE FROM character_roles;",
  "DELETE FROM character_races;",
  "DELETE FROM characters;",
  "",
];

// Loop through each character and generate INSERT statements for all four tables
for (const [i, char] of characters.entries()) {
  const id = i + 1; // IDs start at 1, not 0

  // Escape single quotes in string values to avoid breaking the SQL
  const name     = char.name.replace(/'/g, "''");
  const origin   = char.origin.replace(/'/g, "''");
  const imageUrl = char.image_url ? `'${char.image_url}'` : "NULL";

  // Insert the main character row
  lines.push(
    `INSERT INTO characters (id, name, origin, book_intro, image_url) VALUES (${id}, '${name}', '${origin}', ${char.book_intro}, ${imageUrl});`
  );

  // Insert race rows — handle both single string and array formats in the JSON
  const races = Array.isArray(char.race) ? char.race : [char.race];
  for (const race of races) {
    lines.push(`INSERT INTO character_races (character_id, race) VALUES (${id}, '${race.replace(/'/g, "''")}');`);
  }

  // Insert role rows — same single-or-array handling as races
  const roles = Array.isArray(char.role) ? char.role : [char.role];
  for (const role of roles) {
    lines.push(`INSERT INTO character_roles (character_id, role) VALUES (${id}, '${role.replace(/'/g, "''")}');`);
  }

  // Insert affiliation rows — always an array in the JSON schema
  for (const aff of char.affiliation) {
    lines.push(`INSERT INTO character_affiliations (character_id, affiliation) VALUES (${id}, '${aff.replace(/'/g, "''")}');`);
  }

  // Blank line between characters for readability in the output file
  lines.push("");
}

// Write the finished SQL to seed.sql next to this script.
// Wrangler doesn't support piping SQL via stdin, so we write a file instead.
const outPath = join(__dirname, "seed.sql");
writeFileSync(outPath, lines.join("\n"));
console.log(`Wrote ${lines.length} lines to ${outPath}`);
