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

async function createPlan(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = await companyService.getCompany(account.company, {select: '_id'});
    const plan = await companyService.createPlan(company, req.body);
    res.json(plan);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}



async function listClients(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = await companyService.getCompany(account.company, {select: '_id'});
    const clients = await companyService.listClients(company, req.query.id);
    res.json(clients);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listScheduledTasks(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = await companyService.getCompany(account.company, {select: '_id'});
    const tasks = await companyService.listScheduledTasks(company, new Date(Number(req.query.start_time)), new Date(Number(req.query.end_time)));
    res.json(tasks);
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
  router.get('/current/tasks/scheduled', accountAuthenticated, listScheduledTasks);
  app.use('/companies', router);
};
