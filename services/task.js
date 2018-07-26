'use strict';

const taskQueries = require('database/queries/task');
const files = require('utils/files');
const errors = require('utils/errors');
const {TaskComment, TaskAttachment} = require('models');
const _ = require('lodash');

const UNALLOWED_TASK_ATTRS = ['_id', 'id', 'company', 'client', 'attachments', 'comments', 'registration_date'];

exports.getTask = async (id, options) => {
  return taskQueries.getTask(id, options);
};

exports.updateTask = async (task, data) => {
  const attrs = _.omit(data, UNALLOWED_TASK_ATTRS);
  const loadedTask = await taskQueries.getTask(task.id);
  loadedTask.set(attrs);
  return loadedTask.save();
};

exports.addTaskComment = async (account, task, text) => {
  const loadedTask = await taskQueries.getTask(task.id, {select: '_id comments'});
  const comment = new TaskComment({
    text,
    account: account.id,
    registration_date: new Date(),
  });
  loadedTask.comments.push(comment);
  await loadedTask.save();
  return comment;
};

exports.addTaskAttachment = async (account, task, file) => {
  const loadedTask = await taskQueries.getTask(task.id, {select: 'client attachments'});
  const filename = await files.uploadTaskAttachment(loadedTask, file);
  const attachment = new TaskAttachment({
    account: account.id,
    name: file.name,
    type: file.mimeType,
    size: file.size,
    file: filename,
    registration_date: new Date(),
  });
  loadedTask.attachments.push(attachment);
  await loadedTask.save();
  return attachment;
};

exports.getTaskAttachment = async (task, attachmentId) => {
  const loadedTask = await taskQueries.getTask(task.id, {select: '_id'});
  const attachment = loadedTask.attachments.id(attachmentId);
  if (!attachment) {
    throw errors.notFoundError('task_attachment_not_found', 'Task attachment not found');
  }
  return attachment;
};

exports.getTaskAttachmentBuffer = async (task, attachmentId) => {
  const loadedTask = await taskQueries.getTask(task.id, {select: '_id'});
  const attachment = await this.getTaskAttachment(task, attachmentId);
  return files.getTaskAttachment(loadedTask, attachment);
};
