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

const PlaceComponent = new Schema({
  name: {type: String},
  short_name: {type: String},
}, {_id: false});

const PlaceLocation = new Schema({
  lat: {type: Number},
  lng: {type: Number},
}, {_id: false});

const TaskPlace = new Schema({
  formatted_address: {type: String},
  street_number: {type: String},
  route: {type: String},
  sublocality: {type: String},
  admin_area: {type: PlaceComponent},
  country: {type: PlaceComponent},
  postal_code: {type: String},
  postal_code_suffix: {type: String},
  url: {type: String},
  location: {type: PlaceLocation},
}, {_id: false});

const ChecklistItem = new Schema({
  name: {type: String, required: true},
  done: {type: Boolean},
}, {_id: false})

const TaskChecklist = new Schema({
  title: {type: String, required: true},
  items: {type: [ChecklistItem]},
}, {_id: false});

const TaskField = new Schema({
  name: {type: String, required: true},
  type: {type: String, required: true},
  value: {type: String},
}, {_id: false});

const Task = new Schema({
  company: {type: ObjectId, ref: 'Company', required: true, index: true},
  client: {type: ObjectId, ref: 'Client', required: true, index: true},
  plan: {type: ObjectId, ref: 'Plan'},
  name: {type: String, required: true},
  status: {type: String, required: true},
  schedule_date: {type: Date},
  counters: {type: TaskCounters, required: true},
  checklists: {type: [TaskChecklist]},
  fields: {type: [TaskField]},
  place: {type: TaskPlace},
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
exports.TaskAttachment = TaskAttachment;
exports.TaskChecklist = TaskChecklist;
exports.TaskComment = TaskComment;
exports.TaskComment = TaskComment;
exports.TaskField = TaskField;
