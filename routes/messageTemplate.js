'use strict';

const {accountAuthenticated, messageTemplateBelongsToCompany} = require('routes/middlewares');
const helpers = require('routes/helpers');
const accountService = require('services/account');
const messageTemplateService = require('services/messageTemplate');
const errors = require('utils/errors');
const logger = require('utils/logger');
const {Company, MessageTemplate} = require('models');

async function createMessageTemplate(req, res) {
  try {
    const account = await accountService.getAccount(req.account.id, {select: 'company'});
    const company = new Company({id: account.company});
    const messageTemplate = await messageTemplateService.createMessageTemplate(company, req.body);
    res.json(messageTemplate);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getMessageTemplate(req, res) {
  try {
    const messageTemplate = await messageTemplateService.getMessageTemplate(req.params.message_template, helpers.getOptions(req));
    res.json(messageTemplate);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateMessageTemplate(req, res) {
  try {
    let messageTemplate = new MessageTemplate({id: req.params.message_template});
    messageTemplate = await messageTemplateService.updateMessageTemplate(messageTemplate, req.body);
    res.json(messageTemplate);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function deleteMessageTemplate(req, res) {
  try {
    let messageTemplate = new MessageTemplate({id: req.params.message_template});
    messageTemplate = await messageTemplateService.deleteMessageTemplate(messageTemplate);
    res.json(messageTemplate);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (express, app) => {
  const messageTemplatesRouter = express.Router({mergeParams: true});
  messageTemplatesRouter.post('', [accountAuthenticated], createMessageTemplate);
  messageTemplatesRouter.get('/:message_template', [accountAuthenticated, messageTemplateBelongsToCompany], getMessageTemplate);
  messageTemplatesRouter.put('/:message_template', [accountAuthenticated, messageTemplateBelongsToCompany], updateMessageTemplate);
  messageTemplatesRouter.delete('/:message_template', [accountAuthenticated, messageTemplateBelongsToCompany], deleteMessageTemplate);
  app.use('/message_templates', messageTemplatesRouter);
};
