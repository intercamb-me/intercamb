'use strict';

const clientQueries = require('database/queries/client');
const {Client, Document} = require('models');
const _ = require('lodash');

const DEFAULT_PHOTO_URL = 'https://cdn.ayro.io/images/account_default_logo.png';
const UNALLOWED_ATTRS = ['_id', 'id', 'company', 'photo_url', 'registration_date'];

exports.listClients = async (company, options) => {
  return clientQueries.findClients({company: company.id}, options || {select: 'forename surname email phone photo_url'});
};

exports.getClient = async (id, options) => {
  return clientQueries.getClient(id, options);
};

exports.createClient = async (company, data) => {
  const now = new Date();
  const client = new Client(data);
  client.company = company.id;
  client.registration_date = now;
  client.photo_url = DEFAULT_PHOTO_URL;
  await client.save();
  const contract = new Document({
    company: company.id,
    client: client.id,
    type: 'contract',
    status: 'pending',
    registration_date: now,
  });
  const identityCard = new Document({
    company: company.id,
    client: client.id,
    type: 'identity',
    status: 'pending',
    registration_date: now,
  });
  const passport = new Document({
    company: company.id,
    client: client.id,
    type: 'passport',
    status: 'pending',
    registration_date: now,
  });
  const birthCertificate = new Document({
    company: company.id,
    client: client.id,
    type: 'birth_certificate',
    status: 'pending',
    registration_date: now,
  });
  const highSchoolCertificate = new Document({
    company: company.id,
    client: client.id,
    type: 'high_school_certificate',
    status: 'pending',
    registration_date: now,
  });
  const highSchoolHistoric = new Document({
    company: company.id,
    client: client.id,
    type: 'high_school_historic',
    status: 'pending',
    registration_date: now,
  });
  const nativeCriminalRecords = new Document({
    company: company.id,
    client: client.id,
    type: 'native_criminal_records',
    status: 'pending',
    registration_date: now,
  });
  const foreignCriminalRecords = new Document({
    company: company.id,
    client: client.id,
    type: 'foreign_criminal_records',
    status: 'pending',
    registration_date: now,
  });
  await Document.insertMany([contract, identityCard, passport, birthCertificate, highSchoolCertificate, highSchoolHistoric, nativeCriminalRecords, foreignCriminalRecords]);
  return client;
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

exports.listDocuments = async (client, options) => {
  return clientQueries.findDocuments({client: client.id}, options);
};
