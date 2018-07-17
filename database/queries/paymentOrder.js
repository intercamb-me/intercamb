'use strict';

const {PaymentOrder} = require('models');
const errors = require('utils/errors');
const queryCommon = require('database/queries/common');
const _ = require('lodash');

function throwPaymentOrderNotFoundIfNeeded(paymentOrder, options) {
  if (!paymentOrder && options.require) {
    throw errors.notFoundError('payment_order_not_found', 'Payment order not found');
  }
}

exports.getPaymentOrder = async (id, options) => {
  const queryBuilder = PaymentOrder.findById(id);
  const filledOptions = queryCommon.fillQuery(queryBuilder, options);
  const paymentOrder = await queryBuilder.exec();
  throwPaymentOrderNotFoundIfNeeded(paymentOrder, filledOptions);
  return paymentOrder;
};

exports.findPaymentOrder = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = PaymentOrder.findOne();
    query(queryBuilder);
  } else {
    queryBuilder = PaymentOrder.findOne(query);
  }
  const filledOptions = queryCommon.fillQuery(queryBuilder, options);
  const paymentOrder = await queryBuilder.exec();
  throwPaymentOrderNotFoundIfNeeded(paymentOrder, filledOptions);
  return paymentOrder;
};

exports.findPaymentOrders = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = PaymentOrder.find();
    query(queryBuilder);
  } else {
    queryBuilder = PaymentOrder.find(query);
  }
  queryCommon.fillQuery(queryBuilder, options);
  return queryBuilder.exec();
};
