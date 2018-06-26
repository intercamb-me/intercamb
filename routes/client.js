'use strict';

const {accountAuthenticated} = require('routes/middlewares');
const accountService = require('services/account');
const clientService = require('services/client');
const constants = require('utils/constants');
const errors = require('utils/errors');
const {Company} = require('models');
const {logger} = require('@ayro/commons');

async function createClient(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id);
    const company = new Company({id: account.company});
    const client = await clientService.createClient(req.account, req.body);
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
  router.post('/', accountAuthenticated, createClient);
  router.put('/', accountAuthenticated, updateClient);
  router.delete('/', accountAuthenticated, removeClient);

  app.use('/clients', router);
};
