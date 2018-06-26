'use strict';

const accountService = require('services/account');
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
