'use strict';

const mongoose = require('mongoose');

const {Schema} = mongoose;
const {ObjectId} = Schema.Types;

const TaskAttachment = new Schema({
  task: {type: ObjectId, ref: 'Task', required: true},
  account: {type: ObjectId, ref: 'Account', required: true, index: true},
  name: {type: String, required: true},
  type: {type: String, required: true},
  size: {type: Number, required: true},
  file: {type: String, required: true},
  registration_date: {type: Date, required: true},
}, {collection: 'tasks_attachments'});

const TaskComment = new Schema({
  task: {type: ObjectId, ref: 'Task', required: true},
  account: {type: ObjectId, ref: 'Account', required: true, index: true},
  text: {type: String, required: true},
  registration_date: {type: Date, required: true},
}, {collection: 'tasks_comments'});

const TaskCounters = new Schema({
  attachments: {type: Number, required: true},
  comments: {type: Number, required: true},
}, {_id: false});

const Task = new Schema({
  company: {type: ObjectId, ref: 'Company', required: true, index: true},
  client: {type: ObjectId, ref: 'Client', required: true, index: true},
  name: {type: String, required: true},
  status: {type: String, required: true},
  schedule_date: {type: Date},
  counters: {type: TaskCounters, required: true},
  registration_date: {type: Date, required: true},
}, {collection: 'tasks'});
Task.virtual('attachments', {
  ref: 'TaskAttachment',
  localField: '_id',
  foreignField: 'task',
});
Task.virtual('comments', {
  ref: 'TaskComment',
  localField: '_id',
  foreignField: 'task',
});

exports.Task = Task;
exports.TaskComment = TaskComment;
exports.TaskAttachment = TaskAttachment;
