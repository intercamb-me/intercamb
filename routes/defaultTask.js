'use strict';

const {accountAuthenticated, defaultTaskBelongsToCompany} = require('routes/middlewares');
const helpers = require('routes/helpers');
const accountService = require('services/account');
const defaultTaskService = require('services/defaultTask');
const errors = require('utils/errors');
const logger = require('utils/logger');
const {Company, DefaultTask} = require('models');

async function createDefaultTask(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const defaultTask = await defaultTaskService.createDefaultTask(company, req.body.name);
    res.json(defaultTask);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getDefaultTask(req, res) {
  try {
    const defaultTask = await defaultTaskService.getDefaultTask(req.params.default_task, helpers.getOptions(req));
    res.json(defaultTask);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateDefaultTask(req, res) {
  try {
    let defaultTask = new DefaultTask({id: req.params.default_task});
    defaultTask = await defaultTaskService.updateDefaultTask(defaultTask, req.body);
    res.json(defaultTask);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function deleteDefaultTask(req, res) {
  try {
    let defaultTask = new DefaultTask({id: req.params.default_task});
    defaultTask = await defaultTaskService.deleteDefaultTask(defaultTask);
    res.json(defaultTask);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (express, app) => {
  const defaultTasksRouter = express.Router({mergeParams: true});
  defaultTasksRouter.post('', [accountAuthenticated], createDefaultTask);
  defaultTasksRouter.get('/:default_task', [accountAuthenticated, defaultTaskBelongsToCompany], getDefaultTask);
  defaultTasksRouter.put('/:default_task', [accountAuthenticated, defaultTaskBelongsToCompany], updateDefaultTask);
  defaultTasksRouter.delete('/:default_task', [accountAuthenticated, defaultTaskBelongsToCompany], deleteDefaultTask);
  app.use('/default_tasks', defaultTasksRouter);
};
