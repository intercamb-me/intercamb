'use strict';

const {Client, Task} = require('models');
const errors = require('utils/errors');
const queryCommon = require('database/queries/common');

function throwClientNotFoundIfNeeded(client, options) {
  if (!client && options.require) {
    throw errors.notFoundError('client_not_found', 'Client not found');
  }
}

function throwTaskNotFoundIfNeeded(task, options) {
  if (!task && options.require) {
    throw errors.notFoundError('task_not_found', 'Task not found');
  }
}

exports.getClient = async (id, options) => {
  const promise = Client.findById(id);
  queryCommon.fillQuery(promise, options || {});
  const client = await promise.exec();
  throwClientNotFoundIfNeeded(client, options);
  return client;
};

exports.findClient = async (query, options) => {
  const promise = Client.findOne(query);
  queryCommon.fillQuery(promise, options || {});
  const client = await promise.exec();
  throwClientNotFoundIfNeeded(client, options);
  return client;
};

exports.findClients = async (query, options) => {
  const promise = Client.find(query);
  queryCommon.fillQuery(promise, options || {});
  return promise.exec();
};

exports.getTask = async (id, options) => {
  const promise = Task.findById(id);
  queryCommon.fillQuery(promise, options || {});
  const task = await promise.exec();
  throwTaskNotFoundIfNeeded(task, options);
  return task;
};

exports.findTask = async (query, options) => {
  const promise = Task.findOne(query);
  queryCommon.fillQuery(promise, options || {});
  const task = await promise.exec();
  throwTaskNotFoundIfNeeded(task, options);
  return task;
};

exports.findTasks = async (query, options) => {
  const promise = Task.find(query);
  queryCommon.fillQuery(promise, options || {});
  return promise.exec();
};

