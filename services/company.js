'use strict';

const accountQueries = require('database/queries/account');
const companyQueries = require('database/queries/company');
const institutionQueries = require('database/queries/institution');
const planQueries = require('database/queries/plan');
const clientQueries = require('database/queries/client');
const taskQueries = require('database/queries/task');
const files = require('utils/files');
const {Company, Client, PaymentOrder} = require('models');
const DateOnly = require('dateonly');
const dateFns = require('date-fns');
const _ = require('lodash');

const DEFAULT_LOGO_URL = 'https://cdn.ayro.io/images/account_default_logo.png';
const DEFAULT_CURRENCY = 'BRL';
const ALLOWED_ATTRS = ['name', 'primary_color', 'text_color', 'available_institutions'];

exports.listAllInstitutions = async () => {
  const institutions = await institutionQueries.findInstitutions();
  return _.sortBy(institutions, (institution) => {
    return institution.name.toLowerCase();
  });
};

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
  await account.update({company: company.id});
  return company;
};

exports.updateCompany = async (company, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  if (attrs.available_institutions) {
    const institutionsSet = new Set(attrs.available_institutions);
    attrs.available_institutions = [...institutionsSet];
  }
  const loadedCompany = await companyQueries.getCompany(company.id);
  loadedCompany.set(attrs);
  return loadedCompany.save();
};

exports.updateCompanyLogo = async (company, logoFile) => {
  const loadedCompany = await companyQueries.getCompany(company.id);
  const logoUrl = await files.uploadCompanyLogo(loadedCompany, logoFile.path);
  loadedCompany.logo_url = logoUrl;
  return loadedCompany.save();
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
    query.sort('-registration_date');
  }, options);
};

exports.searchClients = async (company, search, options) => {
  const regexp = new RegExp(search, 'i');
  return clientQueries.findClients((query) => {
    query.where('company').equals(company.id);
    query.or([
      {forename: regexp},
      {surname: regexp},
      {email: regexp},
      {phone: regexp},
    ]);
    query.sort('-registration_date');
  }, options);
};

exports.countClients = async (company) => {
  return Client.countDocuments({company: company.id});
};

exports.listTasks = async (company, startDate, endDate, options) => {
  return taskQueries.findTasks((query) => {
    query.where('company').equals(company.id);
    query.where('status').equals('pending');
    query.where('schedule_date').gte(startDate).lte(endDate);
    query.sort('schedule_date');
    query.sort('name');
  }, options);
};

exports.getClientsPerMonthReport = async (company) => {
  let startDate = new Date();
  startDate = dateFns.startOfMonth(startDate);
  startDate = dateFns.addMonths(startDate, -12);
  const aggregate = Client.aggregate();
  aggregate.match({company: company._id, registration_date: {$gte: startDate}});
  aggregate.group({
    _id: {
      year: {$year: '$registration_date'},
      month: {$month: '$registration_date'},
    },
    count: {$sum: 1},
  });
  return aggregate.exec();
};

exports.getClientsPerPlanReport = async (company) => {
  let startDate = new Date();
  startDate = dateFns.startOfMonth(startDate);
  startDate = dateFns.addMonths(startDate, -12);
  const aggregate = Client.aggregate();
  aggregate.match({company: company._id, registration_date: {$gte: startDate}});
  aggregate.group({
    _id: '$plan',
    count: {$sum: 1},
  });
  return aggregate.exec();
};

exports.getBillingPerMonthReport = async (company) => {
  let startDate = new Date();
  startDate = dateFns.startOfMonth(startDate);
  startDate = dateFns.addMonths(startDate, -12);
  const aggregate = PaymentOrder.aggregate();
  aggregate.match({company: company._id, payment_date: {$gte: new DateOnly(startDate).valueOf()}});
  aggregate.group({
    _id: {
      $let: {
        vars: {
          date: {
            $dateFromString: {
              dateString: {
                $toString: {
                  $toLong: {
                    $add: ['$payment_date', 100],
                  },
                },
              },
              format: '%Y%m%d',
            },
          },
        },
        in: {
          year: {$year: '$$date'},
          month: {$month: '$$date'},
        },
      },
    },
    amount: {$sum: '$amount'},
  });
  return aggregate.exec();
};
