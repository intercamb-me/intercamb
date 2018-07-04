'use strict';

const {accountAuthenticated, clientBelongsToCompany, taskBelongsToClient} = require('routes/middlewares');
const accountService = require('services/account');
const clientService = require('services/client');
const errors = require('utils/errors');
const logger = require('utils/logger');
const {Company, Client, Task} = require('models');

async function listClients(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const clients = await clientService.listClients(company);
    res.json(clients);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getClient(req, res) {
  try {
    const client = await clientService.getClient(req.params.client);
    res.json(client);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function createClient(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const client = await clientService.createClient(company, req.body);
    res.json(client);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateClient(req, res) {
  try {
    let client = new Client({id: req.params.client});
    client = await clientService.updateClient(client, req.body);
    res.json(client);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function removeClient(req, res) {
  try {
    const client = new Client({id: req.params.client});
    await clientService.removeClient(client);
    res.json({});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listTasks(req, res) {
  try {
    const client = new Company({id: req.params.client});
    const tasks = await clientService.listTasks(client);
    res.json(tasks);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getTask(req, res) {
  try {
    const task = await clientService.getTask(req.params.task);
    res.json(task);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateTask(req, res) {
  try {
    let task = new Task({id: req.params.task});
    task = await clientService.updateTask(task, req.body);
    res.json(task);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function addTaskComment(req, res) {
  try {
    const task = new Task({id: req.params.task});
    const comment = await clientService.addTaskComment(req.account, task, req.body.text);
    res.json(comment);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.get('/', accountAuthenticated, listClients);
  router.get('/:client', [accountAuthenticated, clientBelongsToCompany], getClient);
  router.post('/', accountAuthenticated, createClient);
  router.put('/:client', [accountAuthenticated, clientBelongsToCompany], updateClient);
  router.delete('/:client', [accountAuthenticated, clientBelongsToCompany], removeClient);
  router.get('/:client/tasks', [accountAuthenticated, clientBelongsToCompany], listTasks);
  router.get('/:client/tasks/:task', [accountAuthenticated, clientBelongsToCompany, taskBelongsToClient], getTask);
  router.put('/:client/tasks/:task', [accountAuthenticated, clientBelongsToCompany, taskBelongsToClient], updateTask);
  router.post('/:client/tasks/:task/comments', [accountAuthenticated, clientBelongsToCompany, taskBelongsToClient], addTaskComment);

  app.use('/clients', router);
};
