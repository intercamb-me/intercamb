'use strict';

const {Company} = require('models');
const errors = require('utils/errors');
const queryCommon = require('database/queries/common');
const _ = require('lodash');

function throwCompanyNotFoundIfNeeded(company, options) {
  if (!company && options.require) {
    throw errors.notFoundError('company_not_found', 'Company not found');
  }
}

exports.getCompany = async (id, options) => {
  const queryBuilder = Company.findById(id);
  queryCommon.fillQuery(queryBuilder, options || {});
  const company = await queryBuilder.exec();
  throwCompanyNotFoundIfNeeded(company, options || {});
  return company;
};

exports.findCompany = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = Company.findOne();
    query(queryBuilder);
  } else {
    queryBuilder = Company.findOne(query);
  }
  queryCommon.fillQuery(queryBuilder, options || {});
  const company = await queryBuilder.exec();
  throwCompanyNotFoundIfNeeded(company, options || {});
  return company;
};
