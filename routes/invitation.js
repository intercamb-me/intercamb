'use strict';

const {accountAuthenticated} = require('routes/middlewares');
const accountService = require('services/account');
const invitationService = require('services/invitation');
const errors = require('utils/errors');
const logger = require('utils/logger');
const {Company} = require('models');

async function createInvitation(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    await invitationService.createInvitation(account, company, req.body.email);
    res.json({});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (express, app) => {
  const router = express.Router({mergeParams: true});
  router.post('/', accountAuthenticated, createInvitation);
  app.use('/invitations', router);
};
