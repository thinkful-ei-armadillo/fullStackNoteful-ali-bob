'use strict';
const express = require('express');
const xss = require('xss');
const logger = require('../src/logger');
const bodyParser = express.json();
const FoldersService = require('./folders-service');
const path = require('path');

const foldersRouter = express.Router();

function sanitizeFolder(folder) {
  const sanitizedFolder = {
    id: folder.id,
    name: xss(folder.name), //sanititze name
  };
  if (folder.description) {
    sanitizedFolder.description = xss(folder.description); //sanitize description
  }
  return sanitizedFolder;
}

foldersRouter
  .route('/api/folders')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    FoldersService.getAllFolders(knexInstance)
      .then(folders => {
        return res.json(folders.map(folder => sanitizeFolder(folder)));
      })
      .catch(next);
  })
  .post(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    let { name } = req.body;
    let newFolder = { name };

    for (const [key, value] of Object.entries(newFolder)) {
      if (!value) {
        return res.status(400).json({
          error: { message: `Missing '${key}' in request body` }
        });
      }
    }

    FoldersService.insertFolder(knexInstance, newFolder)
      .then(folder => {
        logger.info(`Created folder with id ${folder.id}.`);
        res
          .status(201)
          .location(path.posix.join(req.originalUrl, `/${folder.id}`))
          .json(sanitizeFolder(folder));
      })
      .catch(next);
  });

foldersRouter
  .route('/api/folders/:folderId')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    const { folderId } = req.params;

    FoldersService.getBoomarkById(knexInstance, folderId)
      .then(folder => {
        if (!folder) {
          logger.error(`Folder with id ${folderId} not found.`);
          return res.status(404).json({ error: { message: `Folder with id ${folderId} not found` } });
        }
        res.json(sanitizeFolder(folder));
      })
      .catch(next);
  })
  .patch(bodyParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const newFolderFields = req.body;
    const { folderId } = req.params;
    FoldersService.updateFolder(knexInstance, folderId, newFolderFields)
      .then(folder => {
        if (!folder) {
          logger.error(`Folder with id ${folderId} not found.`);
          return res.status(404).json({ error: { message: `Folder with id ${folderId} not found` } });
        }
        logger.info(`Folder with id ${folderId} updated.`);
        res.json(sanitizeFolder(folder));
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const knexInstance = req.app.get('db');
    const { folderId } = req.params;
    FoldersService.deleteFolder(knexInstance, folderId)
      .then((folder) => {
        if (!folder) {
          logger.error(`Folder with id ${folderId} not found.`);
          return res.status(404).json({ error: { message: `Folder with id ${folderId} not found` } });
        }
        logger.info(`Folder with id ${folderId} deleted.`);
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;
