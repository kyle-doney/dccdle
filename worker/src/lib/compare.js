// compare.js - Character attribute comparison logic.
// Given a guessed character and the answer, produces a result for each attribute
// telling the frontend whether the player was correct, partially correct, or wrong.

/**
 * multiMatch
 *
 * Compares two arrays of values (e.g. race or affiliation lists).
 * Returns "correct" if both sets are identical, "partial" if they share
 * at least one value, and "incorrect" if they share nothing.
 *
 * @param {string[]} guessVals  - The guessed character's values for this attribute
 * @param {string[]} answerVals - The answer character's values for this attribute
 * @returns {"correct"|"partial"|"incorrect"}
 */
function multiMatch(guessVals, answerVals) {
  const g = new Set(guessVals);
  const a = new Set(answerVals);
  const overlap = [...g].filter((v) => a.has(v)); // values that appear in both sets

  if (overlap.length === 0) return "incorrect";
  if (overlap.length === g.size && g.size === a.size) return "correct"; // sets are equal
  return "partial";
}

/**
 * singleMatch
 *
 * Compares two scalar values (e.g. origin).
 * Either they match exactly or they don't — no partial credit here.
 *
 * @param {*} a - Guessed value
 * @param {*} b - Answer value
 * @returns {"correct"|"incorrect"}
 */
function singleMatch(a, b) {
  return a === b ? "correct" : "incorrect";
}

/**
 * bookMatch
 *
 * Compares the book number where the character was introduced.
 * Returns "correct" for an exact match, "higher" if the answer is a later book,
 * or "lower" if the answer is an earlier book.
 * The frontend shows ▲ for "higher" and ▼ for "lower" so the player knows which direction to go.
 *
 * @param {number} guessBook  - Book number of the guessed character
 * @param {number} answerBook - Book number of the answer character
 * @returns {"correct"|"higher"|"lower"}
 */
function bookMatch(guessBook, answerBook) {
  if (guessBook === answerBook) return "correct";
  return guessBook < answerBook ? "higher" : "lower";
}

/**
 * compareCharacters
 *
 * Runs all attribute comparisons between a guess and the answer.
 * Returns one result object per attribute so the frontend can color each tile.
 * The name field only includes the value (no result) — the route handler
 * determines the name tile color based on whether the whole guess was correct.
 *
 * @param {Object} guess  - The character the player guessed
 * @param {Object} answer - Today's correct answer character
 * @returns {Object} Comparison map with { value, result } for each attribute
 */
export function compareCharacters(guess, answer) {
  return {
    name:        { value: guess.name },  // no result — handled by the route
    race:        { value: guess.race,        result: multiMatch(guess.race, answer.race) },
    role:        { value: guess.role,        result: multiMatch(guess.role, answer.role) },
    origin:      { value: guess.origin,      result: singleMatch(guess.origin, answer.origin) },
    affiliation: { value: guess.affiliation, result: multiMatch(guess.affiliation, answer.affiliation) },
    book_intro:  { value: guess.book_intro,  result: bookMatch(guess.book_intro, answer.book_intro) },
  };
}
