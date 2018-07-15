'use strict';

const planQueries = require('database/queries/plan');
const {Plan} = require('models');
const _ = require('lodash');

const ALLOWED_ATTRS = ['name', 'price', 'currency'];

exports.getPlan = async (id, options) => {
  return planQueries.getPlan(id, options);
};

exports.createPlan = async (company, data) => {
  const plan = new Plan({
    company: company.id,
    name: data.name,
    price: data.price,
    currency: data.currency,
    registration_date: new Date(),
  });
  return plan.save();
};

exports.updatePlan = async (plan, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  const loadedPlan = await planQueries.getPlan(plan.id);
  await loadedPlan.update(attrs, {runValidators: true});
  loadedPlan.set(attrs);
  return loadedPlan;
};

exports.deletePlan = async (plan) => {
  const loadedPlan = await planQueries.getPlan(plan.id);
  await loadedPlan.remove();
};
