'use strict';

const queries = require('database/queries');
const {PaymentOrder} = require('models');
const _ = require('lodash');

const ALLOWED_ATTRS = ['method', 'amount', 'due_date', 'payment_date'];

exports.getPaymentOrder = async (id, options) => {
  return queries.get(PaymentOrder, id, options);
};

exports.updatePaymentOrder = async (paymentOrder, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  const loadedPaymentOrder = await queries.get(PaymentOrder, paymentOrder.id);
  loadedPaymentOrder.set(attrs);
  return loadedPaymentOrder.save();
};

exports.deletePaymentOrder = async (paymentOrder) => {
  const loadedPaymentOrder = await queries.get(PaymentOrder, paymentOrder.id);
  await loadedPaymentOrder.remove();
};
