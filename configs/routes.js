'use strict';

const companyRoutes = require('routes/company');
const accountRoutes = require('routes/account');
const clientRoutes = require('routes/client');
const logger = require('utils/logger');

exports.configure = (express, app) => {
  logger.info('Configuring routes');
  companyRoutes(express.Router({mergeParams: true}), app);
  accountRoutes(express.Router({mergeParams: true}), app);
  clientRoutes(express.Router({mergeParams: true}), app);
};
