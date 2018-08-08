'use strict';

const settings = require('configs/settings');
const {accountAuthenticated} = require('routes/middlewares');
const helpers = require('routes/helpers');
const accountService = require('services/account');
const companyService = require('services/company');
const errors = require('utils/errors');
const logger = require('utils/logger');
const {Company} = require('models');
const multer = require('multer');

const upload = multer({dest: settings.uploadsPath});

async function listAllInstitutions(req, res) {
  try {
    const institutions = await companyService.listAllInstitutions();
    res.json(institutions);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function createCompany(req, res) {
  try {
    const company = await companyService.createCompany(req.account, req.body);
    res.json(company);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getCompany(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = await companyService.getCompany(account.company, helpers.getOptions(req));
    res.json(company);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateCompany(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    let company = new Company({id: account.company});
    company = await companyService.updateCompany(company, req.body);
    res.json(company);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateCompanyLogo(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    let company = new Company({id: account.company});
    company = await companyService.updateCompanyLogo(company, req.file);
    res.json(company);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function invite(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    await companyService.invite(account, company, req.body.email);
    res.json({});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listAccounts(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const accounts = await companyService.listAccounts(company);
    res.json(accounts);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listPlans(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const clients = await companyService.listPlans(company);
    res.json(clients);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listClients(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    let clients;
    if (req.query.search) {
      clients = await companyService.searchClients(company, req.query.search, helpers.getOptions(req));
    } else {
      clients = await companyService.listClients(company, req.query.id, helpers.getOptions(req));
    }
    res.json(clients);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listClientsToReview(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const clients = await companyService.listClientsToReview(company, helpers.getOptions(req));
    res.json(clients);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function countClients(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const count = await companyService.countClients(company);
    res.json({count});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listScheduledTasks(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const tasks = await companyService.listScheduledTasks(company, new Date(Number(req.query.start_time)), new Date(Number(req.query.end_time)), helpers.getOptions(req));
    res.json(tasks);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listPendingPaymentOrders(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const paymentOrders = await companyService.listPendingPaymentOrders(company, helpers.getOptions(req));
    res.json(paymentOrders);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listOverduePaymentOrders(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const paymentOrders = await companyService.listOverduePaymentOrders(company, helpers.getOptions(req));
    res.json(paymentOrders);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getClientsPerMonthReport(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const clientsPerMonth = await companyService.getClientsPerMonthReport(company);
    res.json(clientsPerMonth);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getClientsPerPlanReport(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const clientsPerPlan = await companyService.getClientsPerPlanReport(company);
    res.json(clientsPerPlan);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getBillingPerMonthReport(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const clientsPerPlan = await companyService.getBillingPerMonthReport(company);
    res.json(clientsPerPlan);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (express, app) => {
  const router = express.Router({mergeParams: true});
  router.get('/institutions', accountAuthenticated, listAllInstitutions);
  router.post('', accountAuthenticated, createCompany);
  router.get('/current', accountAuthenticated, getCompany);
  router.put('/current', accountAuthenticated, updateCompany);
  router.put('/current/logo', [accountAuthenticated, upload.single('logo')], updateCompanyLogo);
  router.get('/current/invite', accountAuthenticated, invite);
  router.get('/current/accounts', accountAuthenticated, listAccounts);
  router.get('/current/plans', accountAuthenticated, listPlans);
  router.get('/current/clients', accountAuthenticated, listClients);
  router.get('/current/clients/review', accountAuthenticated, listClientsToReview);
  router.get('/current/clients/count', accountAuthenticated, countClients);
  router.get('/current/tasks/scheduled', accountAuthenticated, listScheduledTasks);
  router.get('/current/payment_orders/pending', accountAuthenticated, listPendingPaymentOrders);
  router.get('/current/payment_orders/overdue', accountAuthenticated, listOverduePaymentOrders);
  router.get('/current/reports/clients_per_month', accountAuthenticated, getClientsPerMonthReport);
  router.get('/current/reports/clients_per_plan', accountAuthenticated, getClientsPerPlanReport);
  router.get('/current/reports/billing_per_month', accountAuthenticated, getBillingPerMonthReport);
  app.use('/companies', router);
};
