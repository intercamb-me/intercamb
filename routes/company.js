'use strict';

const settings = require('configs/settings');
const {accountAuthenticated, companyMember} = require('routes/middlewares');
const accountService = require('services/account');
const companyService = require('services/company');
const errors = require('utils/errors');
const {Company} = require('models');
const {logger} = require('@ayro/commons');
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
    const account = await accountService.getAccount(req.account.id);
    const company = await companyService.getCompany(account.company);
    res.json(company);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateCurrentCompany(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id);
    let company = new Company({id: account.company});
    company = await companyService.updateCompany(company, req.body);
    res.json(company);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateCurrentCompanyLogo(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id);
    let company = new Company({id: account.company});
    company = await companyService.updateCompanyLogo(company, req.file);
    res.json(company);
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

  app.use('/companies', router);
};
