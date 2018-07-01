'use strict';

const clientQueries = require('database/queries/client');
const {Client, Task} = require('models');
const _ = require('lodash');

const DEFAULT_PHOTO_URL = 'https://cdn.ayro.io/images/account_default_logo.png';
const UNALLOWED_CLIENT_ATTRS = ['_id', 'id', 'company', 'photo_url', 'registration_date'];
const UNALLOWED_TASK_ATTRS = ['_id', 'id', 'company', 'client', 'registration_date'];

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
  const contract = new Task({
    company: company.id,
    client: client.id,
    type: 'contract',
    status: 'pending',
    properties: {
      schedulable: false,
    },
    registration_date: now,
  });
  const identityCard = new Task({
    company: company.id,
    client: client.id,
    type: 'identity',
    status: 'pending',
    properties: {
      schedulable: false,
    },
    registration_date: now,
  });
  const passport = new Task({
    company: company.id,
    client: client.id,
    type: 'passport',
    status: 'pending',
    properties: {
      schedulable: false,
    },
    registration_date: now,
  });
  const birthCertificate = new Task({
    company: company.id,
    client: client.id,
    type: 'birth_certificate',
    status: 'pending',
    properties: {
      schedulable: false,
    },
    registration_date: now,
  });
  const highSchoolCertificate = new Task({
    company: company.id,
    client: client.id,
    type: 'high_school_certificate',
    status: 'pending',
    properties: {
      schedulable: false,
    },
    registration_date: now,
  });
  const highSchoolHistoric = new Task({
    company: company.id,
    client: client.id,
    type: 'high_school_historic',
    status: 'pending',
    properties: {
      schedulable: false,
    },
    registration_date: now,
  });
  const nativeCriminalRecords = new Task({
    company: company.id,
    client: client.id,
    type: 'native_criminal_records',
    status: 'pending',
    properties: {
      schedulable: false,
    },
    registration_date: now,
  });
  const foreignCriminalRecords = new Task({
    company: company.id,
    client: client.id,
    type: 'foreign_criminal_records',
    status: 'pending',
    properties: {
      schedulable: true,
    },
    registration_date: now,
  });
  const foreignIdentity = new Task({
    company: company.id,
    client: client.id,
    type: 'foreign_identity',
    status: 'pending',
    properties: {
      schedulable: true,
    },
    registration_date: now,
  });
  const reception = new Task({
    company: company.id,
    client: client.id,
    type: 'reception',
    status: 'pending',
    properties: {
      schedulable: true,
    },
    registration_date: now,
  });
  await Task.insertMany([
    contract,
    identityCard,
    passport,
    birthCertificate,
    highSchoolCertificate,
    highSchoolHistoric,
    nativeCriminalRecords,
    foreignCriminalRecords,
    foreignIdentity,
    reception,
  ]);
  return client;
};

exports.updateClient = async (client, data) => {
  const attrs = _.omit(data, UNALLOWED_CLIENT_ATTRS);
  const loadedClient = await this.getClient(client.id);
  await loadedClient.update(attrs, {runValidators: true});
  loadedClient.set(attrs);
  return loadedClient;
};

exports.removeClient = async () => {

};

exports.listTasks = async (client, options) => {
  return clientQueries.findTasks({client: client.id}, options);
};

exports.getTask = async (id, options) => {
  return clientQueries.getTask(id, options);
};

exports.updateTask = async (task, data) => {
  const attrs = _.omit(data, UNALLOWED_TASK_ATTRS);
  const loadedTask = await this.getTask(task.id);
  await loadedTask.update(attrs, {runValidators: true});
  loadedTask.set(attrs);
  return loadedTask;
};
