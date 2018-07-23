'use strict';

const settings = require('configs/settings');
const logger = require('utils/logger');
const {Client} = require('models/Client');
const {Task, TaskComment, TaskAttachment} = require('models/Task');
const mongoose = require('mongoose');
const DateOnly = require('mongoose-dateonly')(mongoose);
const Promise = require('bluebird');

const {Schema} = mongoose;
const {ObjectId} = Schema.Types;

const options = {useNewUrlParser: true};
if (settings.mongo.username && settings.mongo.password) {
  options.user = settings.mongo.username;
  options.pass = settings.mongo.password;
  options.authSource = 'admin';
}

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
  company: {type: ObjectId, ref: 'Company', index: true},
  first_name: {type: String, required: true},
  last_name: {type: String, required: true},
  email: {type: String, required: true, unique: true},
  password: {type: String, required: true},
  image_url: {type: String},
  registration_date: {type: Date, required: true},
}, {collection: 'accounts'});

const Company = new Schema({
  owner: {type: ObjectId, ref: 'Account', required: true},
  name: {type: String, required: true},
  logo_url: {type: String},
  currency: {type: String},
  primary_color: {type: String},
  text_color: {type: String},
  registration_date: {type: Date, required: true},
}, {collection: 'companies'});

const PaymentOrder = new Schema({
  company: {type: ObjectId, ref: 'Company', required: true},
  client: {type: ObjectId, ref: 'Client', required: true, index: true},
  method: {type: String, required: true},
  amount: {type: Number, required: true},
  due_date: {type: DateOnly},
  payment_date: {type: DateOnly},
  registration_date: {type: Date, required: true},
}, {collection: 'payment_orders'});

const Plan = new Schema({
  company: {type: ObjectId, ref: 'Company', required: true, index: true},
  name: {type: String, required: true},
  price: {type: Number, required: true},
  registration_date: {type: Date, required: true},
}, {collection: 'plans'});

const Token = new Schema({
  company: {type: ObjectId, ref: 'Company', required: true, index: true},
  creator: {type: ObjectId, ref: 'Account', required: true},
  identifier: {type: String, required: true},
  type: {type: String, required: true},
  expiration_date: {type: Date, required: true},
  registration_date: {type: Date, required: true},
}, {collection: 'tokens'});

exports.Account = mongoose.model('Account', normalizeSchema(Account, (account) => {
  delete account.password;
}));
exports.Client = mongoose.model('Client', normalizeSchema(Client));
exports.Company = mongoose.model('Company', normalizeSchema(Company));
exports.PaymentOrder = mongoose.model('PaymentOrder', normalizeSchema(PaymentOrder));
exports.Plan = mongoose.model('Plan', normalizeSchema(Plan));
exports.Task = mongoose.model('Task', normalizeSchema(Task));
exports.TaskAttachment = mongoose.model('TaskAttachment', normalizeSchema(TaskAttachment));
exports.TaskComment = mongoose.model('TaskComment', normalizeSchema(TaskComment));
exports.Token = mongoose.model('Token', normalizeSchema(Token));
