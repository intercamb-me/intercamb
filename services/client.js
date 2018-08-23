'use strict';

const queries = require('database/queries');
const brazilianStates = require('resources/brazilianStates');
const errors = require('utils/errors');
const files = require('utils/files');
const {Client, Company, PaymentOrder, Task, TaskAttachment, TaskComment} = require('models');
const cepPromise = require('cep-promise');
const _ = require('lodash');

const DEFAULT_PHOTO_URL = 'https://cdn.intercamb.me/images/client_default_photo.png';
const UNALLOWED_CLIENT_ATTRS = ['_id', 'id', 'company', 'photo_url', 'registration_date'];

async function createTasks(company, client) {
  const loadedCompany = await queries.get(Company, company.id, {select: 'default_tasks'});
  const now = new Date();
  const tasks = [];
  loadedCompany.default_tasks.forEach((defaultTask) => {
    tasks.push(new Task({
      company: loadedCompany.id,
      client: client.id,
      name: defaultTask,
      status: 'pending',
      counters: {
        attachments: 0,
        comments: 0,
      },
      registration_date: now,
    }));
  });
  return Task.insertMany(tasks);
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

exports.updateClientPhoto = async (client, photoFile) => {
  const loadedClient = await queries.get(Client, client.id);
  const photoUrl = await files.uploadClientPhoto(loadedClient, photoFile.path);
  loadedClient.photo_url = photoUrl;
  return loadedClient.save();
};

exports.deleteClient = async (client) => {
  const loadedClient = await queries.get(Client, client.id, {select: '_id'});
  const tasks = await queries.list(Task, {client: loadedClient.id}, {select: '_id'});
  const tasksIds = _.map(tasks, task => task.id);
  await TaskAttachment.remove({task: tasksIds});
  await TaskComment.remove({task: tasksIds});
  await Task.remove({client: loadedClient.id});
  await PaymentOrder.remove({client: loadedClient.id});
  await Client.remove({_id: loadedClient.id});
  await files.deleteClientMedia(loadedClient);
};

exports.createTask = async (company, client, name) => {
  const task = new Task({
    name,
    company: company.id,
    client: client.id,
    status: 'pending',
    counters: {
      attachments: 0,
      comments: 0,
    },
    registration_date: new Date(),
  });
  await task.save();
  return task;
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

exports.createPaymentOrders = async (client, paymentOrders) => {
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
