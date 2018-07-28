'use strict';

const settings = require('configs/settings');
const {accountAuthenticated, taskBelongsToCompany} = require('routes/middlewares');
const helpers = require('routes/helpers');
const taskService = require('services/task');
const errors = require('utils/errors');
const logger = require('utils/logger');
const {Task} = require('models');
const multer = require('multer');

const upload = multer({dest: settings.uploadsPath});

async function getTask(req, res) {
  try {
    const task = await taskService.getTask(req.params.task, helpers.getOptions(req));
    res.json(task);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateTask(req, res) {
  try {
    let task = new Task({id: req.params.task});
    task = await taskService.updateTask(task, req.body);
    res.json(task);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function addTaskComment(req, res) {
  try {
    const task = new Task({id: req.params.task});
    const comment = await taskService.addTaskComment(req.account, task, req.body.text);
    res.json(comment);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function addTaskAttachment(req, res) {
  try {
    const {file} = req;
    const task = new Task({id: req.params.task});
    const attachment = await taskService.addTaskAttachment(req.account, task, {
      path: file.path,
      name: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
    });
    res.json(attachment);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getTaskAttachmentFile(req, res) {
  try {
    const task = new Task({id: req.params.task});
    const attachment = await taskService.getTaskAttachment(task, req.params.attachment);
    const attachmentBuffer = await taskService.getTaskAttachmentBuffer(task, req.params.attachment);
    res.set({
      'Content-Type': attachment.type,
      'Content-Length': attachment.size,
    });
    res.status(200).end(attachmentBuffer);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.get('/:task', [accountAuthenticated, taskBelongsToCompany], getTask);
  router.put('/:task', [accountAuthenticated, taskBelongsToCompany], updateTask);
  router.post('/:task/comments', [accountAuthenticated, taskBelongsToCompany], addTaskComment);
  router.post('/:task/attachments', [accountAuthenticated, taskBelongsToCompany, upload.single('file')], addTaskAttachment);
  router.get('/:task/attachments/:attachment/file', [accountAuthenticated, taskBelongsToCompany], getTaskAttachmentFile);
  app.use('/tasks', router);
};
