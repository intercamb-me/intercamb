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

async function getCurrentCompany(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = await companyService.getCompany(account.company);
    res.json(company);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateCurrentCompany(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    let company = await companyService.getCompany(account.company, {select: ''});
    company = await companyService.updateCompany(company, req.body);
    res.json(company);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateCurrentCompanyLogo(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    let company = await companyService.getCompany(account.company, {select: ''});
    company = await companyService.updateCompanyLogo(company, req.file);
    res.json(company);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function listCurrentCompanyAccounts(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: ''});
    const company = await companyService.getCompany(account.company, {select: ''});
    const accounts = await companyService.listCompanyAccounts(company);
    res.json(accounts);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.post('', accountAuthenticated, createCompany);
  router.get('/current', accountAuthenticated, getCurrentCompany);
  router.put('/current', accountAuthenticated, updateCurrentCompany);
  router.put('/current/logo', [accountAuthenticated, upload.single('logo')], updateCurrentCompanyLogo);
  router.get('/current/accounts', accountAuthenticated, listCurrentCompanyAccounts);

  app.use('/companies', router);
};
