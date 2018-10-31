'use strict';

const queries = require('database/queries');
const postman = require('services/postman');
const errors = require('utils/errors');
const {Client, MessageTemplate} = require('models');
const _ = require('lodash');

const ALLOWED_ATTRS = ['identifier', 'title', 'body'];

function getEmailContext(client) {
  return {
    client: {
      forename: client.forename,
      surname: client.surname,
      email: client.email,
      phone: client.phone,
      full_name: `${client.forename} ${client.surname}`,
    },
  };
}

exports.getMessageTemplate = async (id, options) => {
  return queries.get(MessageTemplate, id, options);
};

exports.createMessageTemplate = async (company, data) => {
  const messageTemplate = new MessageTemplate({
    identifier: data.identifier,
    title: data.title,
    body: data.body,
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

exports.sendMessageTemplate = async (messageTemplate, client) => {
  const loadedMessageTemplate = await queries.get(MessageTemplate, messageTemplate.id);
  const loadedClient = await queries.get(Client, client.id, {select: '_id forename surname email phone metadata', populate: 'company'});
  const company = loadedClient.company;
  const context = getEmailContext(loadedClient);
  const title = await postman.renderString(loadedMessageTemplate.title, context);
  const body = await postman.renderString(loadedMessageTemplate.body, context);
  const fromEmail = postman.formatEmail(company.name, company.contact_email);
  const toEmail = postman.formatEmail(loadedClient.forename, loadedClient.email);
  await postman.send(fromEmail, toEmail, title, body);
  loadedClient.metadata.messages_sent.push(loadedMessageTemplate.id);
  await loadedClient.save();
};
