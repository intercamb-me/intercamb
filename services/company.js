'use strict';

const accountQueries = require('database/queries/account');
const companyQueries = require('database/queries/company');
const clientQueries = require('database/queries/client');
const taskQueries = require('database/queries/task');
const {Company} = require('models');
const dateFns = require('date-fns');

const DEFAULT_LOGO_URL = 'https://cdn.ayro.io/images/account_default_logo.png';

exports.getCompany = async (id) => {
  return companyQueries.getCompany(id);
};

exports.createCompany = async (account, name) => {
  const company = new Company({
    name,
    owner: account.id,
    logo_url: DEFAULT_LOGO_URL,
    registration_date: new Date(),
  });
  await company.save();
  await account.update({company: company.id}, {runValidators: true});
  return company;
};

exports.updateCompany = async () => {

};

exports.updateCompanyLogo = async () => {

};

exports.listAccounts = async (company, options) => {
  return accountQueries.findAccounts({company: company.id}, options);
};

exports.listClients = async (company, ids, options) => {
  return clientQueries.findClients((query) => {
    query.where('company').equals(company.id);
    if (ids) {
      query.where('_id').in(ids);
    }
  }, options || {select: 'forename surname email phone photo_url'});
};

exports.listScheduledTasks = async (company, startDate, endDate) => {
  return taskQueries.findTasks((query) => {
    query.where('company').equals(company.id);
    query.where('status').equals('pending');
    query.where('schedule_date').gte(startDate).lte(endDate);
    query.sort('schedule_date');
  });
};
