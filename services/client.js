'use strict';

const clientQueries = require('database/queries/client');
const {Client} = require('models');
const _ = require('lodash');

const DEFAULT_PHOTO_URL = 'https://cdn.ayro.io/images/account_default_logo.png';
const UNALLOWED_ATTRS = ['_id', 'id', 'company', 'photo_url', 'registration_date']

exports.listClients = async (company, options) => {
  return clientQueries.findClients({company: company.id}, options || {select: 'forename surname email phone photo_url'});
};

exports.getClient = async (id, options) => {
  return clientQueries.getClient(id, options);
};

exports.createClient = async (company, data) => {
  const client = new Client(data);
  client.company = company.id;
  client.registration_date = new Date();
  client.photo_url = DEFAULT_PHOTO_URL;
  return client.save();
};

exports.updateClient = async (client, data) => {
  const attrs = _.omit(data, UNALLOWED_ATTRS);
  const loadedClient = await this.getClient(client.id);
  await loadedClient.update(attrs, {runValidators: true});
  loadedClient.set(attrs);
  return loadedClient;
};

exports.removeClient = async () => {

};
