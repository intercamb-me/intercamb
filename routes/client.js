'use strict';

const {accountAuthenticated, clientBelongsToCompany} = require('routes/middlewares');
const accountService = require('services/account');
const clientService = require('services/client');
const tokenService = require('services/token');
const errors = require('utils/errors');
const logger = require('utils/logger');
const {Company, Client} = require('models');

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
    let token;
    let client;
    if (req.query.token) {
      const data = req.body;
      data.needs_revision = true;
      token = await tokenService.getToken(req.query.token);
      client = await clientService.createClient(token.company, data);
    } else {
      await accountAuthenticated(req, res, () => {});
      const account = await accountService.getAccount(req.account.id, {select: 'company'});
      const company = new Company({id: account.company});
      client = await clientService.createClient(company, req.body);
    }
    if (token) {
      await tokenService.removeToken(token);
    }
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

module.exports = (router, app) => {
  router.get('/:client', [accountAuthenticated, clientBelongsToCompany], getClient);
  router.post('/', createClient);
  router.put('/:client', [accountAuthenticated, clientBelongsToCompany], updateClient);
  router.delete('/:client', [accountAuthenticated, clientBelongsToCompany], removeClient);
  router.get('/:client/tasks', [accountAuthenticated, clientBelongsToCompany], listTasks);

  app.use('/clients', router);
};
