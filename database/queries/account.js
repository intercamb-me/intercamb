'use strict';

const {Account} = require('models');
const errors = require('utils/errors');
const queryCommon = require('database/queries/common');
const _ = require('lodash');

function throwAccountNotFoundIfNeeded(account, options) {
  if (!account && options.require) {
    throw errors.notFoundError('account_not_found', 'Account not found');
  }
}

exports.getAccount = async (id, options) => {
  const queryBuilder = Account.findById(id);
  queryCommon.fillQuery(queryBuilder, options || {});
  const account = await queryBuilder.exec();
  throwAccountNotFoundIfNeeded(account, options);
  return account;
};

exports.findAccount = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = Account.findOne();
    query(queryBuilder);
  } else {
    queryBuilder = Account.findOne(query);
  }
  queryCommon.fillQuery(queryBuilder, options || {});
  const account = await queryBuilder.exec();
  throwAccountNotFoundIfNeeded(account, options);
  return account;
};

exports.findAccounts = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = Account.find();
    query(queryBuilder);
  } else {
    queryBuilder = Account.find(query);
  }
  queryCommon.fillQuery(queryBuilder, options || {});
  return queryBuilder.exec();
};
