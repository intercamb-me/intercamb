'use strict';

const paymentOrderQueries = require('database/queries/paymentOrder');
const {PaymentOrder} = require('models');
const _ = require('lodash');

const ALLOWED_ATTRS = ['name', 'price'];

exports.getPaymentOrder = async (id, options) => {
  return paymentOrderQueries.getPaymentOrder(id, options);
};

exports.updatePaymentOrder = async (paymentOrder, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  const loadedPaymentOrder = await paymentOrderQueries.getPaymentOrder(paymentOrder.id);
  await loadedPaymentOrder.update(attrs, {runValidators: true});
  loadedPaymentOrder.set(attrs);
  return loadedPaymentOrder;
};

exports.deletePaymentOrder = async (paymentOrder) => {
  const loadedPaymentOrder = await paymentOrderQueries.getPaymentOrder(paymentOrder.id);
  await loadedPaymentOrder.remove();
};
