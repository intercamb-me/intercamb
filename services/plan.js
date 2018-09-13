'use strict';

const queries = require('database/queries');
const {Client, DefaultTask, Plan, Task} = require('models');
const _ = require('lodash');

const ALLOWED_ATTRS = ['name', 'price'];

exports.getPlan = async (id, options) => {
  return queries.get(Plan, id, options);
};

exports.createPlan = async (company, data) => {
  const plan = new Plan({
    company: company.id,
    name: data.name,
    price: data.price,
    registration_date: new Date(),
  });
  return plan.save();
};

exports.updatePlan = async (plan, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  const loadedPlan = await queries.get(Plan, plan.id);
  loadedPlan.set(attrs);
  return loadedPlan.save();
};

exports.deletePlan = async (plan) => {
  const loadedPlan = await queries.get(Plan, plan.id);
  await Task.updateMany({plan: loadedPlan.id}, {plan: null});
  await Client.updateMany({plan: loadedPlan.id}, {plan: null});
  await DefaultTask.deleteMany({plan: loadedPlan.id});
  await loadedPlan.remove();
};
