'use strict';

const mongoose = require('mongoose');

const {Schema} = mongoose;
const {ObjectId} = Schema.Types;

const Attachment = new Schema({
  name: {type: String, required: true},
  type: {type: String, required: true},
  size: {type: Number, required: true},
  url: {type: String, required: true},
}, {_id: false});

const Properties = new Schema({
  schedulable: {type: Boolean},
  schedule_date: {type: Date},
}, {_id: false});

const Task = new Schema({
  company: {type: ObjectId, ref: 'Company', required: true},
  client: {type: ObjectId, ref: 'Client', required: true},
  type: {type: String, required: true},
  status: {type: String, required: true},
  properties: {type: Properties},
  attachments: {type: [Attachment], default: undefined},
  registration_date: {type: Date, required: true},
});

exports.Task = Task;
