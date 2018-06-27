'use strict';

const {Company} = require('models');
const errors = require('utils/errors');
const queryCommon = require('database/queries/common');

function throwCompanyNotFoundIfNeeded(company, options) {
  if (!company && options.require) {
    throw errors.notFoundError('company_not_found', 'Company not found');
  }
}

exports.getCompany = async (id, options) => {
  const promise = Company.findById(id);
  queryCommon.fillQuery(promise, options || {});
  const company = await promise.exec();
  throwCompanyNotFoundIfNeeded(company, options);
  return company;
};

exports.findCompany = async (query, options) => {
  const promise = Company.findOne(query);
  queryCommon.fillQuery(promise, options || {});
  const company = await promise.exec();
  throwCompanyNotFoundIfNeeded(company, options);
  return company;
};
