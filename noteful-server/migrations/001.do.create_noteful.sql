CREATE TABLE folders (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL
);

CREATE TABLE notes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    name TEXT NOT NULL,
    content TEXT NOT NULL
);

CREATE TABLE folders_notes (
    id INTEGER PRIMARY KEY GENERATED BY DEFAULT AS IDENTITY,
    folder_id INTEGER REFERENCES notes
(id) ON
DELETE CASCADE NOT NULL,
    notes_id INTEGER
REFERENCES folders
(id) ON
DELETE CASCADE NOT NULL

)