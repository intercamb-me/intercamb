'use strict';

const mongoose = require('mongoose');

const {Schema} = mongoose;
const {ObjectId} = Schema.Types;

const TaskAttachment = new Schema({
  account: {type: ObjectId, ref: 'Account', required: true},
  name: {type: String, required: true},
  type: {type: String, required: true},
  size: {type: Number, required: true},
  file: {type: String, required: true},
  registration_date: {type: Date, required: true},
});

const TaskComment = new Schema({
  account: {type: ObjectId, ref: 'Account', required: true},
  text: {type: String, required: true},
  registration_date: {type: Date, required: true},
});

const Task = new Schema({
  company: {type: ObjectId, ref: 'Company', required: true},
  client: {type: ObjectId, ref: 'Client', required: true},
  name: {type: String, required: true},
  status: {type: String, required: true},
  schedule_date: {type: Date},
  comments: {type: [TaskComment]},
  attachments: {type: [TaskAttachment]},
  registration_date: {type: Date, required: true},
}, {collection: 'tasks'});

exports.Task = Task;
exports.TaskComment = TaskComment;
exports.TaskAttachment = TaskAttachment;
