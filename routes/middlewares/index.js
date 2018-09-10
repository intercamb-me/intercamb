'use strict';

const accountService = require('services/account');
const clientService = require('services/client');
const defaultTaskService = require('services/defaultTask');
const planService = require('services/plan');
const paymentService = require('services/payment');
const taskService = require('services/task');
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

exports.defaultTaskBelongsToCompany = async (req, res, next) => {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const defaultTask = await defaultTaskService.getDefaultTask(req.params.default_task, {select: 'company'});
    if (defaultTask.company.toString() !== account.company.toString()) {
      errors.respondWithError(res, errors.notFoundError('default_task_not_found', 'Task not found'));
      return;
    }
    next();
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
};


exports.taskBelongsToCompany = async (req, res, next) => {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const task = await taskService.getTask(req.params.task, {select: 'company'});
    if (task.company.toString() !== account.company.toString()) {
      errors.respondWithError(res, errors.notFoundError('task_not_found', 'Task not found'));
      return;
    }
    next();
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
};

exports.attachmentBelongsToCompany = async (req, res, next) => {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const attachment = await taskService.getTaskAttachment(req.params.attachment, {select: 'task'});
    const task = await taskService.getTask(attachment.task, {select: 'company'});
    if (task.company.toString() !== account.company.toString()) {
      errors.respondWithError(res, errors.notFoundError('task_attachment_not_found', 'Task attachment not found'));
      return;
    }
    next();
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
};

exports.paymentOrderBelongsToCompany = async (req, res, next) => {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const paymentOrder = await paymentService.getPaymentOrder(req.params.payment_order, {select: 'company'});
    if (paymentOrder.company.toString() !== account.company.toString()) {
      errors.respondWithError(res, errors.notFoundError('payment_order_not_found', 'Payment order not found'));
      return;
    }
    next();
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
};

exports.planBelongsToCompany = async (req, res, next) => {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const plan = await planService.getPlan(req.params.plan, {select: 'company'});
    if (plan.company.toString() !== account.company.toString()) {
      errors.respondWithError(res, errors.notFoundError('plan_not_found', 'Plan not found'));
      return;
    }
    next();
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
};
