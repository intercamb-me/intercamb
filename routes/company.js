'use strict';

const settings = require('configs/settings');
const {accountAuthenticated} = require('routes/middlewares');
const accountService = require('services/account');
const companyService = require('services/company');
const errors = require('utils/errors');
const logger = require('utils/logger');
const multer = require('multer');

const upload = multer({dest: settings.uploadsPath});

async function createCompany(req, res) {
  try {
    const company = await companyService.createCompany(req.account, req.body.name);
    res.json(company);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getCompany(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = await companyService.getCompany(account.company);
    res.json(company);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateCompany(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    let company = await companyService.getCompany(account.company, {select: '_id'});
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
    let company = await companyService.getCompany(account.company, {select: '_id'});
    company = await companyService.updateCompanyLogo(company, req.file);
    res.json(company);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listAccounts(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = await companyService.getCompany(account.company, {select: '_id'});
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
    const company = await companyService.getCompany(account.company, {select: '_id'});
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
    const company = await companyService.getCompany(account.company, {select: '_id'});
    const options = {select: req.query.select};
    let clients;
    if (req.query.search) {
      clients = await companyService.searchClients(company, req.query.search, options);
    } else {
      clients = await companyService.listClients(company, req.query.id, options);
    }
    res.json(clients);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function countClients(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = await companyService.getCompany(account.company, {select: '_id'});
    const count = await companyService.countClients(company);
    res.json({count});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listTasks(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = await companyService.getCompany(account.company, {select: '_id'});
    const tasks = await companyService.listTasks(company, new Date(Number(req.query.start_time)), new Date(Number(req.query.end_time)));
    res.json(tasks);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function countTasks(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = await companyService.getCompany(account.company, {select: '_id'});
    const count = await companyService.countTasks(company, new Date(Number(req.query.start_time)), new Date(Number(req.query.end_time)));
    res.json({count});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getClientsPerMonthReport(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = await companyService.getCompany(account.company, {select: '_id'});
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
    const company = await companyService.getCompany(account.company, {select: '_id'});
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
    const company = await companyService.getCompany(account.company, {select: '_id'});
    const clientsPerPlan = await companyService.getBillingPerMonthReport(company);
    res.json(clientsPerPlan);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.post('', accountAuthenticated, createCompany);
  router.get('/current', accountAuthenticated, getCompany);
  router.put('/current', accountAuthenticated, updateCompany);
  router.put('/current/logo', [accountAuthenticated, upload.single('logo')], updateCompanyLogo);
  router.get('/current/accounts', accountAuthenticated, listAccounts);
  router.get('/current/plans', accountAuthenticated, listPlans);
  router.get('/current/clients', accountAuthenticated, listClients);
  router.get('/current/clients/count', accountAuthenticated, countClients);
  router.get('/current/tasks', accountAuthenticated, listTasks);
  router.get('/current/tasks/count', accountAuthenticated, countTasks);
  router.get('/current/reports/clients_per_month', accountAuthenticated, getClientsPerMonthReport);
  router.get('/current/reports/clients_per_plan', accountAuthenticated, getClientsPerPlanReport);
  router.get('/current/reports/billing_per_month', accountAuthenticated, getBillingPerMonthReport);
  app.use('/companies', router);
};
