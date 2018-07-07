'use strict';

const taskQueries = require('database/queries/task');
const files = require('utils/files');
const errors = require('utils/errors');
const _ = require('lodash');

const UNALLOWED_TASK_ATTRS = ['_id', 'id', 'company', 'client', 'attachments', 'comments', 'registration_date'];

exports.getTask = async (id, options) => {
  return taskQueries.getTask(id, options);
};

exports.updateTask = async (task, data) => {
  const attrs = _.omit(data, UNALLOWED_TASK_ATTRS);
  const loadedTask = await taskQueries.getTask(task.id);
  await loadedTask.update(attrs, {runValidators: true});
  loadedTask.set(attrs);
  return loadedTask;
};

exports.addTaskComment = async (account, task, text) => {
  const loadedTask = await taskQueries.getTask(task.id, {select: ''});
  const count = loadedTask.comments.push({
    text,
    account: account.id,
    registration_date: new Date(),
  });
  await loadedTask.save();
  return loadedTask.comments[count - 1];
};

exports.addTaskAttachment = async (account, task, file) => {
  const loadedTask = await taskQueries.getTask(task.id, {select: ''});
  const filename = await files.uploadTaskAttachment(loadedTask, file);
  const count = loadedTask.attachments.push({
    account: account.id,
    name: file.name,
    type: file.mimeType,
    size: file.size,
    file: filename,
    registration_date: new Date(),
  });
  await loadedTask.save();
  return loadedTask.attachments[count - 1];
};

exports.getTaskAttachment = async (task, attachmentId) => {
  const loadedTask = await taskQueries.getTask(task.id, {select: ''});
  const attachment = loadedTask.attachments.id(attachmentId);
  if (!attachment) {
    throw errors.notFoundError('task_attachment_not_found', 'Task attachment not found');
  }
  return attachment;
};

exports.getTaskAttachmentBuffer = async (task, attachmentId) => {
  const loadedTask = await taskQueries.getTask(task.id, {select: ''});
  const attachment = await this.getTaskAttachment(task, attachmentId);
  return files.getTaskAttachment(loadedTask, attachment);
};
