'use strict';

const {Task} = require('models');
const errors = require('utils/errors');
const queryCommon = require('database/queries/common');
const _ = require('lodash');

function throwTaskNotFoundIfNeeded(task, options) {
  if (!task && options.require) {
    throw errors.notFoundError('task_not_found', 'Task not found');
  }
}

exports.getTask = async (id, options) => {
  const queryBuilder = Task.findById(id);
  const filledOptions = queryCommon.fillQuery(queryBuilder, options);
  const task = await queryBuilder.exec();
  throwTaskNotFoundIfNeeded(task, filledOptions);
  return task;
};

exports.findTask = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = Task.findOne();
    query(queryBuilder);
  } else {
    queryBuilder = Task.findOne(query);
  }
  const filledOptions = queryCommon.fillQuery(queryBuilder, options);
  const task = await queryBuilder.exec();
  throwTaskNotFoundIfNeeded(task, filledOptions);
  return task;
};

exports.findTasks = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = Task.find();
    query(queryBuilder);
  } else {
    queryBuilder = Task.find(query);
  }
  queryCommon.fillQuery(queryBuilder, options);
  return queryBuilder.exec();
};
