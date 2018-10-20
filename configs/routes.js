'use strict';

const accountRoutes = require('routes/account');
const clientRoutes = require('routes/client');
const companyRoutes = require('routes/company');
const defaultTaskRoutes = require('routes/defaultTask');
const invitationRoutes = require('routes/invitation');
const messageTemplateRoutes = require('routes/messageTemplate');
const paymentRoutes = require('routes/payment');
const planRoutes = require('routes/plan');
const taskRoutes = require('routes/task');
const tokenRoutes = require('routes/token');
const logger = require('utils/logger');

exports.configure = (express, app) => {
  logger.info('Configuring routes');
  accountRoutes(express, app);
  clientRoutes(express, app);
  companyRoutes(express, app);
  defaultTaskRoutes(express, app);
  invitationRoutes(express, app);
  messageTemplateRoutes(express, app);
  paymentRoutes(express, app);
  planRoutes(express, app);
  taskRoutes(express, app);
  tokenRoutes(express, app);
};
