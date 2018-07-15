'use strict';

const {Plan} = require('models');
const errors = require('utils/errors');
const queryCommon = require('database/queries/common');
const _ = require('lodash');

function throwPlanNotFoundIfNeeded(plan, options) {
  if (!plan && options.require) {
    throw errors.notFoundError('plan_not_found', 'Plan not found');
  }
}

exports.getPlan = async (id, options) => {
  const queryBuilder = Plan.findById(id);
  const filledOptions = queryCommon.fillQuery(queryBuilder, options);
  const plan = await queryBuilder.exec();
  throwPlanNotFoundIfNeeded(plan, filledOptions);
  return plan;
};

exports.findPlan = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = Plan.findOne();
    query(queryBuilder);
  } else {
    queryBuilder = Plan.findOne(query);
  }
  const filledOptions = queryCommon.fillQuery(queryBuilder, options);
  const plan = await queryBuilder.exec();
  throwPlanNotFoundIfNeeded(plan, filledOptions);
  return plan;
};

exports.findPlans = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = Plan.find();
    query(queryBuilder);
  } else {
    queryBuilder = Plan.find(query);
  }
  queryCommon.fillQuery(queryBuilder, options);
  return queryBuilder.exec();
};
