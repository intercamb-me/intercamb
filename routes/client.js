'use strict';

const {accountAuthenticated, clientBelongsToCompany} = require('routes/middlewares');
const accountService = require('services/account');
const clientService = require('services/client');
const errors = require('utils/errors');
const logger = require('utils/logger');
const {Company, Client} = require('models');

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
    const account = await accountService.getAccount(req.account.id);
    const company = new Company({id: account.company});
    const client = await clientService.createClient(company, req.body);
    res.json(client);
  } catch (err) {
    logger.log({level: 'error', message: err});
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

async function listDocuments(req, res) {
  try {
    const client = new Company({id: req.params.client});
    const documents = await clientService.listDocuments(client);
    res.json(documents);
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
  router.get('/:client/documents', [accountAuthenticated, clientBelongsToCompany], listDocuments);

  app.use('/clients', router);
};
