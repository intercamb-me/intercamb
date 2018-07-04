'use strict';

const mongoose = require('mongoose');

const {Schema} = mongoose;
const {ObjectId} = Schema.Types;

const TaskAttachment = new Schema({
  name: {type: String, required: true},
  type: {type: String, required: true},
  size: {type: Number, required: true},
  url: {type: String, required: true},
});

const TaskComment = new Schema({
  account: {type: ObjectId, ref: 'Account', required: true},
  text: {type: String, required: true},
  registration_date: {type: Date, required: true},
});

const TaskProperties = new Schema({
  schedule_date: {type: Date},
}, {_id: false});

const Task = new Schema({
  company: {type: ObjectId, ref: 'Company', required: true},
  client: {type: ObjectId, ref: 'Client', required: true},
  name: {type: String, required: true},
  status: {type: String, required: true},
  schedulable: {type: Boolean, required: true},
  properties: {type: TaskProperties},
  attachments: {type: [TaskAttachment], default: undefined},
  comments: {type: [TaskComment], default: undefined},
  registration_date: {type: Date, required: true},
});

exports.Task = Task;
exports.TaskComment = TaskComment;
