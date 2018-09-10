'use strict';

const queries = require('database/queries');
const files = require('utils/files');
const {DefaultTask} = require('models');
const _ = require('lodash');

const ALLOWED_ATTRS = ['name', 'checklists', 'fields'];

exports.getDefaultTask = async (id, options) => {
  return queries.get(DefaultTask, id, options);
};

exports.createDefaultTask = async (company, name) => {
  const defaultTask = new DefaultTask({
    name,
    company: company.id,
    registration_date: new Date(),
  });
  return defaultTask.save();
};

exports.updateDefaultTask = async (defaultDefaultTask, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  const loadedDefaultTask = await queries.get(DefaultTask, defaultDefaultTask.id);
  loadedDefaultTask.set(attrs);
  return loadedDefaultTask.save();
};

exports.deleteDefaultTask = async (defaultDefaultTask) => {
  const loadedDefaultTask = await queries.get(DefaultTask, defaultDefaultTask.id, {select: 'client'});
  await DefaultTask.remove({_id: loadedDefaultTask.id});
};
