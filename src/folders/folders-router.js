const path = require('path');
const express = require('express');
const xss = require('xss');
const FoldersService = require('./folders-service');

const foldersRouter = express.Router();
const jsonParser = express.json();

const serializeFolder = folder => ({
  id: folder.id,
  name: xss(folder.name)
});

foldersRouter
  .route('/')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    FoldersService.getAllFolders(knexInstance)
      .then(folders => {
        res.json(folders.map(serializeFolder));
      })
      .catch(next);
  })
  .post(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        error: {
          message: 'Missing name in request body'
        }
      });
    }

    const newFolder = {
      name
    };

    FoldersService.insertFolder(knexInstance, newFolder).then(folder =>
      res
        .status(201)
        .location(path.posix.join(req.originalUrl + `/${folder.id}`))
        .json(serializeFolder(folder))
    );
  });

foldersRouter
  .route('/:folder_id')
  .all((req, res, next) => {
    const knexInstance = req.app.get('db');
    FoldersService.getById(knexInstance, req.params.folder_id)
      .then(folder => {
        if (!folder) {
          return res.status(404).json({
            error: {
              message: `Folder doesn't exist`
            }
          });
        }
        res.folder = folder;
        next();
      })
      .catch(next);
  })
  .get((req, res, next) => {
    res.json(serializeFolder(res.folder));
  })
  .delete((req, res, next) => {
    FoldersService.deleteFolder(req.app.get('db'), req.params.folder_id)
      .then(() => {
        res.status(204).end();
      })
      .catch(next);
  })
  .patch(jsonParser, (req, res, next) => {
    const knexInstance = req.app.get('db');
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({
        error: {
          message: `Request body must contain 'name'`
        }
      });
    }

    FoldersService.updateFolder(knexInstance, req.params.folder_id, { name })
      .then(numRowsAffected => {
        res.status(204).end();
      })
      .catch(next);
  });

module.exports = foldersRouter;
