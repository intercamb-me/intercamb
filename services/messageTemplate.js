'use strict';

const queries = require('database/queries');
const {MessageTemplate} = require('models');
const _ = require('lodash');

const ALLOWED_ATTRS = ['identifier', 'title', 'template'];

exports.getMessageTemplate = async (id, options) => {
  return queries.get(MessageTemplate, id, options);
};

exports.createMessageTemplate = async (company, data) => {
  const messageTemplate = new MessageTemplate({
    identifier: data.identifier,
    title: data.title,
    template: data.template,
    company: company.id,
    registration_date: new Date(),
  });
  return messageTemplate.save();
};

exports.updateMessageTemplate = async (messageTemplate, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  const loadedMessageTemplate = await queries.get(MessageTemplate, messageTemplate.id, {select: '_id'});
  loadedMessageTemplate.set(attrs);
  return loadedMessageTemplate.save();
};

exports.deleteMessageTemplate = async (messageTemplate) => {
  const loadedMessageTemplate = await queries.get(MessageTemplate, messageTemplate.id, {select: '_id'});
  await loadedMessageTemplate.remove();
};
