DELETE FROM character_affiliations;
DELETE FROM character_roles;
DELETE FROM character_races;
DELETE FROM characters;

INSERT INTO characters (id, name, origin, book_intro, image_url) VALUES (1, 'Carl', 'Earth', 1, NULL);
INSERT INTO character_races (character_id, race) VALUES (1, 'Human');
INSERT INTO character_races (character_id, race) VALUES (1, 'Primal');
INSERT INTO character_roles (character_id, role) VALUES (1, 'Crawler');
INSERT INTO character_affiliations (character_id, affiliation) VALUES (1, 'Princess Posse');

INSERT INTO characters (id, name, origin, book_intro, image_url) VALUES (2, 'Princess Donut', 'Earth', 1, NULL);
INSERT INTO character_races (character_id, race) VALUES (2, 'Cat');
INSERT INTO character_roles (character_id, role) VALUES (2, 'Crawler');
INSERT INTO character_affiliations (character_id, affiliation) VALUES (2, 'Team Donut');

INSERT INTO characters (id, name, origin, book_intro, image_url) VALUES (3, 'Mordecai', 'Dungeon', 1, NULL);
INSERT INTO character_races (character_id, race) VALUES (3, 'Bopca');
INSERT INTO character_roles (character_id, role) VALUES (3, 'Trainer');
INSERT INTO character_affiliations (character_id, affiliation) VALUES (3, 'Team Donut');
