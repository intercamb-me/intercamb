'use strict';

const queries = require('database/queries');
const {DefaultTask} = require('models');
const _ = require('lodash');

const ALLOWED_ATTRS = ['name', 'checklists', 'fields'];

exports.getDefaultTask = async (id, options) => {
  return queries.get(DefaultTask, id, options);
};

exports.createDefaultTask = async (company, data) => {
  const defaultTask = new DefaultTask({
    name: data.name,
    plan: data.plan,
    company: company.id,
    registration_date: new Date(),
  });
  return defaultTask.save();
};

exports.updateDefaultTask = async (defaultTask, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  const loadedDefaultTask = await queries.get(DefaultTask, defaultTask.id, {select: '_id'});
  loadedDefaultTask.set(attrs);
  return loadedDefaultTask.save();
};

exports.deleteDefaultTask = async (defaultTask) => {
  const loadedDefaultTask = await queries.get(DefaultTask, defaultTask.id, {select: '_id'});
  await loadedDefaultTask.remove();
};
