'use strict';

const accountRoutes = require('routes/account');
const companyRoutes = require('routes/company');
const invitationRoutes = require('routes/invitation');
const tokenRoutes = require('routes/token');
const planRoutes = require('routes/plan');
const clientRoutes = require('routes/client');
const taskRoutes = require('routes/task');
const paymentRoutes = require('routes/payment');
const logger = require('utils/logger');

exports.configure = (express, app) => {
  logger.info('Configuring routes');
  accountRoutes(express, app);
  companyRoutes(express, app);
  invitationRoutes(express, app);
  tokenRoutes(express, app);
  planRoutes(express, app);
  clientRoutes(express, app);
  taskRoutes(express, app);
  paymentRoutes(express, app);
};
