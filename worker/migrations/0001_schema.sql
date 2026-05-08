DROP TABLE IF EXISTS character_affiliations;
DROP TABLE IF EXISTS character_roles;
DROP TABLE IF EXISTS character_races;
DROP TABLE IF EXISTS characters;

CREATE TABLE characters (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    NOT NULL UNIQUE,
  origin     TEXT    NOT NULL,
  book_intro INTEGER NOT NULL CHECK (book_intro BETWEEN 1 AND 7),
  image_url  TEXT
);

CREATE TABLE character_races (
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  race         TEXT    NOT NULL,
  PRIMARY KEY (character_id, race)
);

CREATE TABLE character_roles (
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  role         TEXT    NOT NULL,
  PRIMARY KEY (character_id, role)
);

CREATE TABLE character_affiliations (
  character_id INTEGER NOT NULL REFERENCES characters(id) ON DELETE CASCADE,
  affiliation  TEXT    NOT NULL,
  PRIMARY KEY (character_id, affiliation)
);
