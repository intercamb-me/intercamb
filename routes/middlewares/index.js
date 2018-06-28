'use strict';

const accountService = require('services/account');
const clientService = require('services/client');
const session = require('database/session');
const errors = require('utils/errors');
const {logger} = require('@ayro/commons');

exports.decodeToken = async (req) => {
  if (req.token) {
    await session.touchToken(req.token);
    const decodedToken = await session.decodeToken(req.token);
    if (decodedToken.account) {
      req.account = decodedToken.account;
      logger.debug('%s %s [Account: %s]', req.method, req.path, req.account.id);
    }
  }
};

exports.accountAuthenticated = async (req, res, next) => {
  try {
    await this.decodeToken(req);
    if (!req.account) {
      errors.respondWithError(res, errors.authenticationError('authentication_required', 'Authentication required'));
      return;
    }
    next();
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
};

exports.clientBelongsToCompany = async (req, res, next) => {
  try {
    if (!req.account) {
      errors.respondWithError(res, errors.authenticationError('authentication_required', 'Authentication required'));
      return;
    }
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const client = await clientService.getClient(req.params.client, {select: 'company'});
    if (!client || client.company.toString() !== account.company.toString()) {
      errors.respondWithError(res, errors.notFoundError('client_not_found', 'Client not found'));
      return;
    }
    next();
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
};
