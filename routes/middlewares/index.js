'use strict';

const accountService = require('services/account');
const clientService = require('services/client');
const session = require('database/session');
const errors = require('utils/errors');
const logger = require('utils/logger');

exports.decodeToken = async (req) => {
  if (req.token) {
    await session.touchToken(req.token);
    const decodedToken = await session.decodeToken(req.token);
    if (decodedToken.account) {
      req.account = decodedToken.account;
      logger.debug(`${req.method} ${req.path} [Account: ${req.account.id}]`);
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
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const client = await clientService.getClient(req.params.client, {select: 'company'});
    if (client.company.toString() !== account.company.toString()) {
      errors.respondWithError(res, errors.notFoundError('client_not_found', 'Client not found'));
      return;
    }
    next();
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
};

exports.taskBelongsToClient = async (req, res, next) => {
  try {
    const client = await clientService.getClient(req.params.client, {select: ''});
    const task = await clientService.getTask(req.params.task, {select: 'client'});
    if (client.id !== task.client.toString()) {
      errors.respondWithError(res, errors.notFoundError('task_not_found', 'Task not found'));
      return;
    }
    next();
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
};

