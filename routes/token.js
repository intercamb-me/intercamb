'use strict';

const {accountAuthenticated} = require('routes/middlewares');
const accountService = require('services/account');
const tokenService = require('services/token');
const errors = require('utils/errors');
const logger = require('utils/logger');
const {Company} = require('models');

async function getToken(req, res) {
  try {
    const token = await tokenService.getToken(req.params.token);
    res.json(token);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}
async function createToken(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const token = await tokenService.createToken(account, company, req.body.identifier, req.body.type);
    res.json(token);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.get('/:token', getToken);
  router.post('/', accountAuthenticated, createToken);

  app.use('/tokens', router);
};
