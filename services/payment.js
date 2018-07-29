'use strict';

const paymentOrderQueries = require('database/queries/payment_order');
const _ = require('lodash');

const ALLOWED_ATTRS = ['method', 'amount', 'due_date', 'payment_date'];

exports.getPaymentOrder = async (id, options) => {
  return paymentOrderQueries.getPaymentOrder(id, options);
};

exports.updatePaymentOrder = async (paymentOrder, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  const loadedPaymentOrder = await paymentOrderQueries.getPaymentOrder(paymentOrder.id);
  loadedPaymentOrder.set(attrs);
  return loadedPaymentOrder.save();
};

exports.deletePaymentOrder = async (paymentOrder) => {
  const loadedPaymentOrder = await paymentOrderQueries.getPaymentOrder(paymentOrder.id);
  await loadedPaymentOrder.remove();
};
