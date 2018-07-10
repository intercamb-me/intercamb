'use strict';

const {Token} = require('models');
const errors = require('utils/errors');
const queryCommon = require('database/queries/common');
const _ = require('lodash');

function throwTokenNotFoundIfNeeded(token, options) {
  if (!token && options.require) {
    throw errors.notFoundError('token_not_found', 'Token not found');
  }
}

exports.getToken = async (id, options) => {
  const queryBuilder = Token.findById(id);
  queryCommon.fillQuery(queryBuilder, options || {});
  const token = await queryBuilder.exec();
  throwTokenNotFoundIfNeeded(token, options || {});
  return token;
};

exports.findToken = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = Token.findOne();
    query(queryBuilder);
  } else {
    queryBuilder = Token.findOne(query);
  }
  queryCommon.fillQuery(queryBuilder, options || {});
  const client = await queryBuilder.exec();
  throwTokenNotFoundIfNeeded(client, options || {});
  return client;
};
