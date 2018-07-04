'use strict';

const settings = require('configs/settings');
const logger = require('utils/logger');
const {Client} = require('models/Client');
const {Task, TaskComment} = require('models/Task');
const mongoose = require('mongoose');
const Promise = require('bluebird');

const {Schema} = mongoose;
const {ObjectId} = Schema.Types;

const options = settings.mongo.username && settings.mongo.password ? {
  user: settings.mongo.username,
  pass: settings.mongo.password,
  authSource: 'admin',
} : {};

mongoose.Promise = Promise;
mongoose.set('debug', settings.mongo.debug);
mongoose.connect(`mongodb://${settings.mongo.host}:${settings.mongo.port}/${settings.mongo.schema}`, options).catch((err) => {
  logger.error('Could not connect to MongoDB.', err);
  process.exit(1);
});

function transform(obj, customTransform) {
  delete obj._id;
  delete obj.__v;
  if (customTransform) {
    customTransform(obj);
  }
  return obj;
}

function normalizeSchema(schema, customTransform) {
  schema.virtual('id').set(function (id) {
    this.set('_id', id);
  });
  schema.set('toJSON', {
    virtuals: true,
    transform: (doc, obj) => {
      return transform(obj, customTransform);
    },
  });
  schema.set('toObject', {
    virtuals: true,
    transform: (doc, obj) => {
      return transform(obj, customTransform);
    },
  });
  return schema;
}

const Account = new Schema({
  company: {type: ObjectId, ref: 'Company'},
  name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  icon_url: {type: String},
  registration_date: {type: Date, required: true},
});

const Company = new Schema({
  owner: {type: ObjectId, ref: 'Account', required: true},
  name: {type: String, required: true},
  logo_url: {type: String},
  registration_date: {type: Date, required: true},
});

exports.Account = mongoose.model('Account', normalizeSchema(Account, (account) => {
  delete account.password;
}));
exports.Company = mongoose.model('Company', normalizeSchema(Company));
exports.Client = mongoose.model('Client', normalizeSchema(Client));
exports.Task = mongoose.model('Task', normalizeSchema(Task));
exports.TaskComment = mongoose.model('TaskComment', normalizeSchema(TaskComment));
