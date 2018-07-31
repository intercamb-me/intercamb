'use strict';

const {
  Account,
  Client,
  Company,
  Institution,
  PaymentOrder,
  Plan,
  Task,
  TaskAttachment,
  TaskComment,
  Token,
} = require('models');
const errors = require('utils/errors');
const _ = require('lodash');

const MODELS = {
  Account: {
    notFoundError: errors.notFoundError('account_not_found', 'Account not found'),
  },
  Client: {
    notFoundError: errors.notFoundError('client_not_found', 'Client not found'),
  },
  Company: {
    notFoundError: errors.notFoundError('company_not_found', 'Company not found'),
  },
  Institution: {
    notFoundError: errors.notFoundError('institution_not_found', 'Institution not found'),
  },
  PaymentOrder: {
    notFoundError: errors.notFoundError('payment_order_not_found', 'Payment order not found'),
  },
  Plan: {
    notFoundError: errors.notFoundError('plan_not_found', 'Plan not found'),
  },
  Task: {
    notFoundError: errors.notFoundError('task_not_found', 'Task not found'),
  },
  TaskAttachment: {
    notFoundError: errors.notFoundError('task_attachment_not_found', 'Task attachment not found'),
  },
  TaskComment: {
    notFoundError: errors.notFoundError('task_comment_not_found', 'Task comment not found'),
  },
  Token: {
    notFoundError: errors.notFoundError('token_not_found', 'Token not found'),
  },
};

function fillQuery(query, options) {
  const filledOptions = options || {};
  if (!_.has(filledOptions, 'require')) {
    filledOptions.require = true;
  }
  if (filledOptions.populate) {
    if (_.isArray(filledOptions.populate)) {
      _.forEach(filledOptions.populate, (populate) => {
        query.populate(populate);
      });
    } else {
      query.populate(filledOptions.populate);
    }
  }
  if (filledOptions.select) {
    query.select(filledOptions.select);
  }
  if (filledOptions.sort) {
    query.sort(filledOptions.sort);
  }
  if (filledOptions.limit) {
    query.limit(filledOptions.limit);
  }
  if (filledOptions.lean) {
    query.lean();
  }
  return filledOptions;
}

function throwNotFoundIfNeeded(model, obj, options) {
  if (!obj && options.require) {
    throw MODELS[model.modelName].notFoundError;
  }
}

exports.get = async (model, id, options) => {
  const queryBuilder = model.findById(id);
  const filledOptions = fillQuery(queryBuilder, options);
  const obj = await queryBuilder.exec();
  throwNotFoundIfNeeded(model, obj, filledOptions);
  return obj;
};

exports.find = async (model, query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = model.findOne();
    query(queryBuilder);
  } else {
    queryBuilder = model.findOne(query);
  }
  const filledOptions = fillQuery(queryBuilder, options);
  const obj = await queryBuilder.exec();
  throwNotFoundIfNeeded(model, obj, filledOptions);
  return obj;
};

exports.list = async (model, query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = model.find();
    query(queryBuilder);
  } else {
    queryBuilder = model.find(query);
  }
  fillQuery(queryBuilder, options);
  return queryBuilder.exec();
};
