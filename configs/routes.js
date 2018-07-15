'use strict';

const accountRoutes = require('routes/account');
const companyRoutes = require('routes/company');
const planRoutes = require('routes/plan');
const clientRoutes = require('routes/client');
const taskRoutes = require('routes/task');
const tokenRoutes = require('routes/token');
const logger = require('utils/logger');

exports.configure = (express, app) => {
  logger.info('Configuring routes');
  accountRoutes(express.Router({mergeParams: true}), app);
  companyRoutes(express.Router({mergeParams: true}), app);
  planRoutes(express.Router({mergeParams: true}), app);
  clientRoutes(express.Router({mergeParams: true}), app);
  taskRoutes(express.Router({mergeParams: true}), app);
  tokenRoutes(express.Router({mergeParams: true}), app);
};
