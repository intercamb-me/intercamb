'use strict';

const accountQueries = require('database/queries/account');
const companyQueries = require('database/queries/company');
const {Company} = require('models');

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

exports.listCompanyAccounts = async (company) => {
  return accountQueries.findAccounts({company: company.id});
};
