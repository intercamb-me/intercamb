'use strict';

const {Client} = require('models');
const errors = require('utils/errors');
const queryCommon = require('database/queries/common');
const _ = require('lodash');

function throwClientNotFoundIfNeeded(client, options) {
  if (!client && options.require) {
    throw errors.notFoundError('client_not_found', 'Client not found');
  }
}

exports.getClient = async (id, options) => {
  const queryBuilder = Client.findById(id);
  queryCommon.fillQuery(queryBuilder, options || {});
  const client = await queryBuilder.exec();
  throwClientNotFoundIfNeeded(client, options);
  return client;
};

exports.findClient = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = Client.findOne();
    query(queryBuilder);
  } else {
    queryBuilder = Client.findOne(query);
  }
  queryCommon.fillQuery(queryBuilder, options || {});
  const client = await queryBuilder.exec();
  throwClientNotFoundIfNeeded(client, options);
  return client;
};

exports.findClients = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = Client.find();
    query(queryBuilder);
  } else {
    queryBuilder = Client.find(query);
  }
  queryCommon.fillQuery(queryBuilder, options || {});
  return queryBuilder.exec();
};
