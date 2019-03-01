'use strict';
const express = require('express');
const xss = require('xss');
const logger = require('../src/logger');
const bodyParser = express.json();
const NotesService = require('./notes-service');
const path = require('path');

const notesRouter = express.Router();

function sanitizeNote(note) {
  const sanitizedNote = {
    id: note.id,
    name: xss(note.name), //sanititze name
    content: xss(note.content),
    modified: note.modified,
    folder_id: note.folder_id
  };

  if (note.description) {
    sanitizedNote.description = xss(note.description); //sanitize description
  }
  return sanitizedNote;
}

notesRouter
  .route('/api/notes')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    NotesService.getAllNotes(knexInstance)
      .then(notes => {
        return res.json(notes.map(note => sanitizeNote(note)));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    let { name, content, folder_id } = req.body;
    let newNote = { name, content, folder_id: parseInt(folder_id) };

    for (const [key, value] of Object.entries(newNote)) {
      if (!value) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    NotesService.insertNote(knexInstance, newNote)
      .then(note => {
        logger.info(`Created note with id ${note.id}.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${note.id}`))
          .json(sanitizeNote(note));
      })
      .catch(next);
  });

notesRouter
  .route('/api/notes/:noteId')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const { noteId } = req.params;

    NotesService.getBoomarkById(knexInstance, noteId)
      .then(note => {
        if (!note) {
          logger.error(`Note with id ${noteId} not found.`);
          return res.status(404).json({ error: { message: `Note with id ${noteId} not found` } });
        }
        res.json(sanitizeNote(note));
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const newNoteFields = req.body;
    const { noteId } = req.params;
    NotesService.updateNote(knexInstance, noteId, newNoteFields)
      .then(note => {
        if (!note) {
          logger.error(`Note with id ${noteId} not found.`);
          return res.status(404).json({ error: { message: `Note with id ${noteId} not found` } });
        }
        logger.info(`Note with id ${noteId} updated.`);
        res.json(sanitizeNote(note));
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    const { noteId } = req.params;
    NotesService.deleteNote(knexInstance, noteId)
      .then((note) => {
        if (!note) {
          logger.error(`Note with id ${noteId} not found.`);
          return res.status(404).json({ error: { message: `Note with id ${noteId} not found` } });
        }
        logger.info(`Note with id ${noteId} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = notesRouter;
