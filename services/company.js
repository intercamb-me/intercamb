'use strict';

const accountQueries = require('database/queries/account');
const companyQueries = require('database/queries/company');
const planQueries = require('database/queries/plan');
const clientQueries = require('database/queries/client');
const taskQueries = require('database/queries/task');
const files = require('utils/files');
const {Company} = require('models');
const _ = require('lodash');

const DEFAULT_LOGO_URL = 'https://cdn.ayro.io/images/account_default_logo.png';
const DEFAULT_CURRENCY = 'BRL';
const ALLOWED_ATTRS = ['name', 'primary_color', 'text_color'];

exports.getCompany = async (id, options) => {
  return companyQueries.getCompany(id, options);
};

exports.createCompany = async (account, name) => {
  const company = new Company({
    name,
    owner: account.id,
    logo_url: DEFAULT_LOGO_URL,
    currency: DEFAULT_CURRENCY,
    registration_date: new Date(),
  });
  await company.save();
  await account.update({company: company.id}, {runValidators: true});
  return company;
};

exports.updateCompany = async (company, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  const loadedCompany = await companyQueries.getCompany(company.id);
  await loadedCompany.update(attrs, {runValidators: true});
  loadedCompany.set(attrs);
  return loadedCompany;
};

exports.updateCompanyLogo = async (company, logoFile) => {
  const loadedCompany = await companyQueries.getCompany(company.id);
  const logoUrl = await files.uploadCompanyLogo(loadedCompany, logoFile.path);
  await loadedCompany.update({logo_url: logoUrl}, {runValidators: true});
  loadedCompany.logo_url = logoUrl;
  return loadedCompany;
};

exports.listAccounts = async (company, options) => {
  return accountQueries.findAccounts({company: company.id}, options);
};

exports.listPlans = async (company, options) => {
  return planQueries.findPlans({company: company.id}, options);
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
    query.sort('name');
  });
};
