'use strict';

const {accountAuthenticated, clientBelongsToCompany, planBelongsToCompany} = require('routes/middlewares');
const accountService = require('services/account');
const clientService = require('services/client');
const tokenService = require('services/token');
const errors = require('utils/errors');
const logger = require('utils/logger');
const {Company, Client, Plan} = require('models');

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

async function getClient(req, res) {
  try {
    const client = await clientService.getClient(req.params.client);
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
    const client = new Client({id: req.params.client});
    const tasks = await clientService.listTasks(client);
    res.json(tasks);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function associatePlan(req, res) {
  try {
    const client = new Client({id: req.params.client});
    const plan = new Plan({id: req.params.plan});
    await clientService.associatePlan(client, plan);
    res.json({});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function dissociatePlan(req, res) {
  try {
    const client = new Client({id: req.params.client});
    await clientService.dissociatePlan(client);
    res.json({});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function registerPaymentOrders(req, res) {
  try {
    const client = new Client({id: req.params.client});
    const paymentOrders = await clientService.registerPaymentOrders(client, req.body);
    res.json(paymentOrders);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listPaymentOrders(req, res) {
  try {
    const client = new Client({id: req.params.client});
    const paymentOrders = await clientService.listPaymentOrders(client);
    res.json(paymentOrders);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function searchAddress(req, res) {
  try {
    const address = await clientService.searchAddress(req.params.code);
    res.json(address);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.post('/', createClient);
  router.get('/:client', [accountAuthenticated, clientBelongsToCompany], getClient);
  router.put('/:client', [accountAuthenticated, clientBelongsToCompany], updateClient);
  router.delete('/:client', [accountAuthenticated, clientBelongsToCompany], removeClient);
  router.get('/:client/tasks', [accountAuthenticated, clientBelongsToCompany], listTasks);
  router.post('/:client/plans/:plan', [accountAuthenticated, clientBelongsToCompany, planBelongsToCompany], associatePlan);
  router.delete('/:client/plans', [accountAuthenticated, clientBelongsToCompany], dissociatePlan);
  router.post('/:client/payment_orders', [accountAuthenticated, clientBelongsToCompany], registerPaymentOrders);
  router.get('/:client/payment_orders', [accountAuthenticated, clientBelongsToCompany], listPaymentOrders);
  app.use('/clients', router);

  app.get('/zip_codes/:code', searchAddress);
};
