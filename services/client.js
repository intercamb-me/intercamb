'use strict';

const clientQueries = require('database/queries/client');
const taskQueries = require('database/queries/task');
const brazilianStates = require('resources/brazilian_states');
const {Client, Task} = require('models');
const cepPromise = require('cep-promise');
const _ = require('lodash');

const DEFAULT_PHOTO_URL = 'https://cdn.ayro.io/images/account_default_logo.png';
const UNALLOWED_CLIENT_ATTRS = ['_id', 'id', 'company', 'photo_url', 'registration_date'];

async function createTasks(company, client) {
  const now = new Date();
  const contract = new Task({
    company: company.id,
    client: client.id,
    name: 'Contrato',
    status: 'pending',
    schedulable: false,
    registration_date: now,
  });
  const identityCard = new Task({
    company: company.id,
    client: client.id,
    name: 'Identidade',
    status: 'pending',
    schedulable: false,
    registration_date: now,
  });
  const passport = new Task({
    company: company.id,
    client: client.id,
    name: 'Passaporte',
    status: 'pending',
    schedulable: false,
    registration_date: now,
  });
  const birthCertificate = new Task({
    company: company.id,
    client: client.id,
    name: 'Certidão de nascimento',
    status: 'pending',
    schedulable: false,
    registration_date: now,
  });
  const highSchoolCertificate = new Task({
    company: company.id,
    client: client.id,
    name: 'Certificado de ensino médio',
    status: 'pending',
    schedulable: false,
    registration_date: now,
  });
  const highSchoolHistoric = new Task({
    company: company.id,
    client: client.id,
    name: 'Histórico do ensino médio',
    status: 'pending',
    schedulable: false,
    registration_date: now,
  });
  const courseEnrolment = new Task({
    company: company.id,
    client: client.id,
    name: 'Inscrição no curso',
    status: 'pending',
    schedulable: false,
    registration_date: now,
  });
  const nativeCriminalRecords = new Task({
    company: company.id,
    client: client.id,
    name: 'Antecedentes criminais',
    status: 'pending',
    schedulable: false,
    registration_date: now,
  });
  const foreignCriminalRecords = new Task({
    company: company.id,
    client: client.id,
    name: 'Antecedentes criminais (Argentina)',
    status: 'pending',
    schedulable: true,
    registration_date: now,
  });
  const foreignIdentity = new Task({
    company: company.id,
    client: client.id,
    name: 'Identidade (Argentina)',
    status: 'pending',
    schedulable: true,
    registration_date: now,
  });
  const reception = new Task({
    company: company.id,
    client: client.id,
    name: 'Recepção',
    status: 'pending',
    schedulable: true,
    registration_date: now,
  });
  const otherDocuments = new Task({
    company: company.id,
    client: client.id,
    name: 'Outros documentos',
    status: 'pending',
    schedulable: false,
    registration_date: now,
  });
  return Task.insertMany([
    contract,
    identityCard,
    passport,
    birthCertificate,
    highSchoolCertificate,
    highSchoolHistoric,
    courseEnrolment,
    nativeCriminalRecords,
    foreignCriminalRecords,
    foreignIdentity,
    reception,
    otherDocuments,
  ]);
}

exports.getClient = async (id, options) => {
  return clientQueries.getClient(id, options);
};

exports.createClient = async (company, data) => {
  const client = new Client(data);
  client.company = company.id;
  client.registration_date = new Date();
  client.photo_url = DEFAULT_PHOTO_URL;
  await client.save();
  await createTasks(company, client);
  return client;
};

exports.updateClient = async (client, data) => {
  const attrs = _.omit(data, UNALLOWED_CLIENT_ATTRS);
  const loadedClient = await clientQueries.getClient(client.id);
  await loadedClient.update(attrs, {runValidators: true});
  loadedClient.set(attrs);
  return loadedClient;
};

exports.removeClient = async () => {

};

exports.listTasks = async (client, options) => {
  return taskQueries.findTasks({client: client.id}, options);
};

exports.associatePlan = async (client, plan) => {
  const loadedClient = await clientQueries.getClient(client.id);
  await loadedClient.update({plan: plan.id}, {runValidators: true});
  loadedClient.plan = plan.id;
  return loadedClient;
};

exports.dissociatePlan = async (client) => {
  const loadedClient = await clientQueries.getClient(client.id);
  await loadedClient.update({plan: null}, {runValidators: true});
  loadedClient.plan = null;
  return loadedClient;
};

exports.searchAddress = async (code) => {
  try {
    const address = await cepPromise(code);
    return {
      zip_code: address.cep,
      city: address.city,
      state: brazilianStates[address.state],
      neighborhood: address.neighborhood,
      public_place: address.street,
    };
  } catch (err) {
    throw errors.notFoundError('address_not_found', 'Address not found');
  }
};
