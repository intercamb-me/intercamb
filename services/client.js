'use strict';

const queries = require('database/queries');
const brazilianStates = require('resources/brazilianStates');
const errors = require('utils/errors');
const {Client, Task, TaskAttachment, TaskComment, PaymentOrder} = require('models');
const cepPromise = require('cep-promise');
const _ = require('lodash');

const DEFAULT_PHOTO_URL = 'https://cdn.intercamb.me/images/client_default_photo.png';
const UNALLOWED_CLIENT_ATTRS = ['_id', 'id', 'company', 'photo_url', 'registration_date'];

async function createTasks(company, client) {
  const now = new Date();
  const contract = new Task({
    company: company.id,
    client: client.id,
    name: 'Contrato',
    status: 'pending',
    schedulable: false,
    counters: {
      attachments: 0,
      comments: 0,
    },
    registration_date: now,
  });
  const identityCard = new Task({
    company: company.id,
    client: client.id,
    name: 'Identidade',
    status: 'pending',
    schedulable: false,
    counters: {
      attachments: 0,
      comments: 0,
    },
    registration_date: now,
  });
  const passport = new Task({
    company: company.id,
    client: client.id,
    name: 'Passaporte',
    status: 'pending',
    schedulable: false,
    counters: {
      attachments: 0,
      comments: 0,
    },
    registration_date: now,
  });
  const birthCertificate = new Task({
    company: company.id,
    client: client.id,
    name: 'Certidão de nascimento',
    status: 'pending',
    schedulable: false,
    counters: {
      attachments: 0,
      comments: 0,
    },
    registration_date: now,
  });
  const highSchoolCertificate = new Task({
    company: company.id,
    client: client.id,
    name: 'Certificado de ensino médio',
    status: 'pending',
    schedulable: false,
    counters: {
      attachments: 0,
      comments: 0,
    },
    registration_date: now,
  });
  const highSchoolHistoric = new Task({
    company: company.id,
    client: client.id,
    name: 'Histórico do ensino médio',
    status: 'pending',
    schedulable: false,
    counters: {
      attachments: 0,
      comments: 0,
    },
    registration_date: now,
  });
  const courseEnrolment = new Task({
    company: company.id,
    client: client.id,
    name: 'Inscrição no curso',
    status: 'pending',
    schedulable: false,
    counters: {
      attachments: 0,
      comments: 0,
    },
    registration_date: now,
  });
  const reception = new Task({
    company: company.id,
    client: client.id,
    name: 'Recepção',
    status: 'pending',
    schedulable: true,
    counters: {
      attachments: 0,
      comments: 0,
    },
    registration_date: now,
  });
  const nativeCriminalRecords = new Task({
    company: company.id,
    client: client.id,
    name: 'Antecedentes criminais',
    status: 'pending',
    schedulable: false,
    counters: {
      attachments: 0,
      comments: 0,
    },
    registration_date: now,
  });
  const foreignCriminalRecords = new Task({
    company: company.id,
    client: client.id,
    name: 'Antecedentes criminais (Argentina)',
    status: 'pending',
    schedulable: true,
    counters: {
      attachments: 0,
      comments: 0,
    },
    registration_date: now,
  });
  const foreignIdentity = new Task({
    company: company.id,
    client: client.id,
    name: 'Identidade (Argentina)',
    status: 'pending',
    schedulable: true,
    counters: {
      attachments: 0,
      comments: 0,
    },
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
    reception,
    nativeCriminalRecords,
    foreignCriminalRecords,
    foreignIdentity,
  ]);
}

exports.getClient = async (id, options) => {
  return queries.get(Client, id, options);
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
  const loadedClient = await queries.get(Client, client.id);
  attrs.needs_revision = false;
  loadedClient.set(attrs);
  return loadedClient.save();
};

exports.removeClient = async (client) => {
  const tasks = await queries.list(Task, {client: client.id}, {select: '_id'});
  const tasksIds = _.map(tasks, task => task.id);
  await TaskAttachment.remove({task: tasksIds});
  await TaskComment.remove({task: tasksIds});
  await Task.remove({client: client.id});
  await PaymentOrder.remove({client: client.id});
  await Client.remove({_id: client.id});
};

exports.listTasks = async (client, options) => {
  return queries.list(Task, {client: client.id}, options);
};

exports.associatePlan = async (client, plan) => {
  const loadedClient = await queries.get(Client, client.id);
  loadedClient.plan = plan.id;
  return loadedClient.save();
};

exports.dissociatePlan = async (client) => {
  const loadedClient = await queries.get(Client, client.id);
  loadedClient.plan = null;
  return loadedClient.save();
};

exports.registerPaymentOrders = async (client, paymentOrders) => {
  const loadedClient = await queries.get(Client, client.id);
  const orders = [];
  _.forEach(paymentOrders, (paymentOrder) => {
    const order = new PaymentOrder({
      client: loadedClient.id,
      company: loadedClient.company,
      method: paymentOrder.method,
      amount: paymentOrder.amount,
      due_date: paymentOrder.due_date,
      registration_date: new Date(),
    });
    orders.push(order);
  });
  return PaymentOrder.insertMany(orders);
};

exports.listPaymentOrders = async (client, options) => {
  return queries.list(PaymentOrder, {client: client.id}, options);
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
