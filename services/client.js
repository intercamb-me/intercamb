'use strict';

const clientQueries = require('database/queries/client');
const {Client} = require('models');

const DEFAULT_PHOTO_URL = 'https://cdn.ayro.io/images/account_default_logo.png';

exports.listClients = async (company) => {
  return clientQueries.findClients({company: company.id}, {select: 'forename surname email phone photo_url'});
};

exports.getClient = async (company, id) => {
  return clientQueries.findClient({_id: id, company: company.id});
};

exports.createClient = async (company, data) => {
  const client = new Client(data);
  client.company = company.id;
  client.registration_date = new Date();
  client.photo_url = DEFAULT_PHOTO_URL;
  return client.save();
};

exports.updateClient = async () => {

};

exports.removeClient = async () => {

};
