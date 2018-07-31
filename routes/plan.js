'use strict';

const {accountAuthenticated, planBelongsToCompany} = require('routes/middlewares');
const accountService = require('services/account');
const companyService = require('services/company');
const planService = require('services/plan');
const errors = require('utils/errors');
const logger = require('utils/logger');
const {Plan} = require('models');

async function createPlan(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = await companyService.getCompany(account.company, {select: '_id'});
    const plan = await planService.createPlan(company, req.body);
    res.json(plan);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getPlan(req, res) {
  try {
    const plan = await planService.getPlan(req.params.plan);
    res.json(plan);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updatePlan(req, res) {
  try {
    let plan = new Plan({id: req.params.plan});
    plan = await planService.updatePlan(plan, req.body);
    res.json(plan);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function deletePlan(req, res) {
  try {
    const plan = new Plan({id: req.params.plan});
    await planService.deletePlan(plan, req.body);
    res.json({});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (express, app) => {
  const router = express.Router({mergeParams: true});
  router.post('', accountAuthenticated, createPlan);
  router.get('/:plan', [accountAuthenticated, planBelongsToCompany], getPlan);
  router.put('/:plan', [accountAuthenticated, planBelongsToCompany], updatePlan);
  router.delete('/:plan', [accountAuthenticated, planBelongsToCompany], deletePlan);
  app.use('/plans', router);
};
