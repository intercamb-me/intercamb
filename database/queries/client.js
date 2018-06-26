'use strict';

const {Client} = require('models');
const errors = require('utils/errors');
const queryCommon = require('database/queries/common');

function throwClientNotFoundIfNeeded(client, options) {
  if (!client && (!options || options.require)) {
    throw errors.notFoundError('client_not_found', 'Client not found');
  }
}

exports.getClient = async (id, options) => {
  const promise = Client.findById(id);
  queryCommon.fillQuery(promise, options);
  const client = await promise.exec();
  throwClientNotFoundIfNeeded(client, options);
  return client;
};

exports.findClient = async (query, options) => {
  const promise = Client.findOne(query);
  queryCommon.fillQuery(promise, options);
  const client = await promise.exec();
  throwClientNotFoundIfNeeded(client, options);
  return client;
};
