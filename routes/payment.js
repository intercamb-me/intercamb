'use strict';

const {accountAuthenticated, paymentOrderBelongsToCompany} = require('routes/middlewares');
const paymentService = require('services/payment');
const errors = require('utils/errors');
const logger = require('utils/logger');
const {PaymentOrder} = require('models');

async function getPaymentOrder(req, res) {
  try {
    const paymentOrder = await paymentService.getPaymentOrder(req.params.payment_order);
    res.json(paymentOrder);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updatePaymentOrder(req, res) {
  try {
    let paymentOrder = new PaymentOrder({id: req.params.payment_order});
    paymentOrder = await paymentService.updatePaymentOrder(paymentOrder, req.body);
    res.json(paymentOrder);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function deletePaymentOrder(req, res) {
  try {
    const paymentOrder = new PaymentOrder({id: req.params.payment_order});
    await paymentService.deletePaymentOrder(paymentOrder, req.body);
    res.json({});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.get('/:payment_order', [accountAuthenticated, paymentOrderBelongsToCompany], getPaymentOrder);
  router.put('/:payment_order', [accountAuthenticated, paymentOrderBelongsToCompany], updatePaymentOrder);
  router.delete('/:payment_order', [accountAuthenticated, paymentOrderBelongsToCompany], deletePaymentOrder);
  app.use('/payment_orders', router);
};
