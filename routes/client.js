'use strict';

const settings = require('configs/settings');
const {accountAuthenticated, clientBelongsToCompany, planBelongsToCompany} = require('routes/middlewares');
const helpers = require('routes/helpers');
const accountService = require('services/account');
const clientService = require('services/client');
const tokenService = require('services/token');
const errors = require('utils/errors');
const logger = require('utils/logger');
const {Company, Client, Plan} = require('models');
const multer = require('multer');

const upload = multer({dest: settings.uploadsPath});

async function createClient(req, res) {
  try {
    let token;
    let client;
    if (req.query.token) {
      req.body.needs_revision = true;
      token = await tokenService.getToken(req.query.token);
      client = await clientService.createClient(token.company, req.body);
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
    const client = await clientService.getClient(req.params.client, helpers.getOptions(req));
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

async function updateClientPhoto(req, res) {
  try {
    let client = new Client({id: req.params.client});
    client = await clientService.updateClientPhoto(client, req.file);
    res.json(client);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function deleteClient(req, res) {
  try {
    const client = new Client({id: req.params.client});
    await clientService.deleteClient(client);
    res.json({});
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

async function createPaymentOrders(req, res) {
  try {
    const client = new Client({id: req.params.client});
    const paymentOrders = await clientService.createPaymentOrders(client, req.body);
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

async function createTask(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const client = new Client({id: req.params.client});
    const task = await clientService.createTask(company, client, req.body.name);
    res.json(task);
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


async function searchAddress(req, res) {
  try {
    const address = await clientService.searchAddress(req.params.code);
    res.json(address);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (express, app) => {
  const router = express.Router({mergeParams: true});
  router.post('/', createClient);
  router.get('/:client', [accountAuthenticated, clientBelongsToCompany], getClient);
  router.put('/:client', [accountAuthenticated, clientBelongsToCompany], updateClient);
  router.put('/:client/photo', [accountAuthenticated, clientBelongsToCompany, upload.single('photo')], updateClientPhoto);
  router.delete('/:client', [accountAuthenticated, clientBelongsToCompany], deleteClient);
  router.post('/:client/plans/:plan', [accountAuthenticated, clientBelongsToCompany, planBelongsToCompany], associatePlan);
  router.delete('/:client/plans', [accountAuthenticated, clientBelongsToCompany], dissociatePlan);
  router.post('/:client/payment_orders', [accountAuthenticated, clientBelongsToCompany], createPaymentOrders);
  router.get('/:client/payment_orders', [accountAuthenticated, clientBelongsToCompany], listPaymentOrders);
  router.post('/:client/tasks', [accountAuthenticated, clientBelongsToCompany], createTask);
  router.get('/:client/tasks', [accountAuthenticated, clientBelongsToCompany], listTasks);
  app.use('/clients', router);

  app.get('/zip_codes/:code', searchAddress);
};
