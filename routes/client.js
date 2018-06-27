'use strict';

const {accountAuthenticated} = require('routes/middlewares');
const accountService = require('services/account');
const clientService = require('services/client');
const constants = require('utils/constants');
const errors = require('utils/errors');
const {Company} = require('models');
const {logger} = require('@ayro/commons');

async function getClient(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id);
    const company = new Company({id: account.company});
    const client = await clientService.getClient(company, req.params.client);
    res.json(client);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listClients(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id);
    const company = new Company({id: account.company});
    const clients = await clientService.listClients(company);
    res.json(clients);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function createClient(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id);
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
    const client = await clientService.updateClient(req.account, req.body);
    res.json(client);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function removeClient(req, res) {
  try {
    const client = await clientService.removeClient(req.account, req.body);
    res.json(client);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.get('/', accountAuthenticated, listClients);
  router.get('/:client', accountAuthenticated, getClient);
  router.post('/', accountAuthenticated, createClient);
  router.put('/', accountAuthenticated, updateClient);
  router.delete('/', accountAuthenticated, removeClient);

  app.use('/clients', router);
};
