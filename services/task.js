'use strict';

const queries = require('database/queries');
const files = require('utils/files');
const {Task, TaskComment, TaskAttachment} = require('models');
const _ = require('lodash');

const ALLOWED_ATTRS = ['name', 'status', 'schedule_date', 'checklists', 'fields', 'place'];

exports.getTask = async (id, options) => {
  return queries.get(Task, id, options);
};

exports.updateTask = async (task, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  const loadedTask = await queries.get(Task, task.id);
  loadedTask.set(attrs);
  return loadedTask.save();
};

exports.deleteTask = async (task) => {
  const loadedTask = await queries.get(Task, task.id, {select: 'client'});
  await TaskAttachment.deleteMany({task: loadedTask.id});
  await TaskComment.deleteMany({task: loadedTask.id});
  await loadedTask.remove();
  await files.deleteTaskMedia(loadedTask);
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
  const loadedTask = await queries.get(Task, task.id, {select: 'client'});
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
  const loadedTask = await queries.get(Task, loadedAttachment.task, {select: 'client'});
  return files.getTaskAttachment(loadedTask, loadedAttachment);
};
