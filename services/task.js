'use strict';

const queries = require('database/queries');
const files = require('utils/files');
const {Task, TaskComment, TaskAttachment} = require('models');
const _ = require('lodash');

const UNALLOWED_TASK_ATTRS = ['_id', 'id', 'company', 'client', 'attachments', 'comments', 'registration_date'];

exports.getTask = async (id, options) => {
  return queries.get(Task, id, options);
};

exports.updateTask = async (task, data) => {
  const attrs = _.omit(data, UNALLOWED_TASK_ATTRS);
  const loadedTask = await queries.get(Task, task.id);
  loadedTask.set(attrs);
  return loadedTask.save();
};

exports.addTaskComment = async (account, task, text) => {
  const loadedTask = await queries.get(Task, task.id, {select: '_id'});
  const comment = new TaskComment({
    text,
    task: loadedTask.id,
    account: account.id,
    registration_date: new Date(),
  });
  await comment.save();
  await Task.updateOne({_id: loadedTask.id}, {$inc: {'counters.comments': 1}}).exec();
  return comment;
};

exports.addTaskAttachment = async (account, task, file) => {
  const loadedTask = await queries.get(Task, task.id, {select: '_id client'});
  const filename = await files.uploadTaskAttachment(loadedTask, file);
  const attachment = new TaskAttachment({
    task: loadedTask.id,
    account: account.id,
    name: file.name,
    type: file.mimeType,
    size: file.size,
    file: filename,
    registration_date: new Date(),
  });
  await attachment.save();
  await Task.updateOne({_id: loadedTask.id}, {$inc: {'counters.attachments': 1}}).exec();
  return attachment;
};

exports.getTaskAttachment = async (id) => {
  return queries.get(TaskAttachment, id);
};

exports.getTaskAttachmentBuffer = async (id) => {
  const loadedAttachment = await queries.get(TaskAttachment, id);
  const loadedTask = await queries.get(Task, loadedAttachment.task, {select: '_id client'});
  return files.getTaskAttachment(loadedTask, loadedAttachment);
};
