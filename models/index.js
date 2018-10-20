'use strict';

const settings = require('configs/settings');
const logger = require('utils/logger');
const {Client} = require('models/client');
const {Task, TaskAttachment, TaskChecklist, TaskComment, TaskField} = require('models/task');
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
mongoose.set('useCreateIndex', true);
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
Account.methods.getFullName = function () {
  return `${this.first_name} ${this.last_name}`;
};

const Company = new Schema({
  owner: {type: ObjectId, ref: 'Account', required: true},
  name: {type: String, required: true},
  contact_email: {type: String, required: true},
  contact_phone: {type: String, required: true},
  website: {type: String},
  logo_url: {type: String},
  currency: {type: String},
  primary_color: {type: String},
  text_color: {type: String},
  institutions: [{type: ObjectId, ref: 'Institution'}],
  registration_date: {type: Date, required: true},
}, {collection: 'companies'});
Company.virtual('accounts', {
  ref: 'Account',
  localField: '_id',
  foreignField: 'company',
});
Company.virtual('default_tasks', {
  ref: 'DefaultTask',
  localField: '_id',
  foreignField: 'company',
});
Company.virtual('message_templates', {
  ref: 'MessageTemplate',
  localField: '_id',
  foreignField: 'company',
});
Company.virtual('plans', {
  ref: 'Plan',
  localField: '_id',
  foreignField: 'company',
});
Company.virtual('tokens', {
  ref: 'Token',
  localField: '_id',
  foreignField: 'company',
});

const MessageTemplate = new Schema({
  company: {type: ObjectId, ref: 'Company', required: true, index: true},
  identifier: {type: String, required: true},
  title: {type: String, required: true},
  template: {type: String, required: true},
  registration_date: {type: Date, required: true},
}, {collection: 'message_templates'});

const DefaultTask = new Schema({
  company: {type: ObjectId, ref: 'Company', required: true, index: true},
  plan: {type: ObjectId, ref: 'Plan', index: true},
  name: {type: String, required: true},
  checklists: {type: [TaskChecklist]},
  fields: {type: [TaskField]},
  registration_date: {type: Date, required: true},
}, {collection: 'default_tasks'});

const Institution = new Schema({
  country: {type: String, required: true},
  name: {type: String, required: true, unique: true},
  acronym: {type: String},
}, {collection: 'institutions'});

const Invitation = new Schema({
  company: {type: ObjectId, ref: 'Company', required: true, index: true},
  creator: {type: ObjectId, ref: 'Account', required: true},
  email: {type: String, required: true},
  expiration_date: {type: Date, required: true},
  registration_date: {type: Date, required: true},
}, {collection: 'invitations'});

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
Plan.virtual('default_tasks', {
  ref: 'DefaultTask',
  localField: '_id',
  foreignField: 'plan',
});

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
exports.DefaultTask = mongoose.model('DefaultTask', normalizeSchema(DefaultTask));
exports.Institution = mongoose.model('Institution', normalizeSchema(Institution));
exports.Invitation = mongoose.model('Invitation', normalizeSchema(Invitation));
exports.MessageTemplate = mongoose.model('MessageTemplate', normalizeSchema(MessageTemplate));
exports.PaymentOrder = mongoose.model('PaymentOrder', normalizeSchema(PaymentOrder));
exports.Plan = mongoose.model('Plan', normalizeSchema(Plan));
exports.Task = mongoose.model('Task', normalizeSchema(Task));
exports.TaskAttachment = mongoose.model('TaskAttachment', normalizeSchema(TaskAttachment));
exports.TaskChecklist = mongoose.model('TaskChecklist', normalizeSchema(TaskChecklist));
exports.TaskComment = mongoose.model('TaskComment', normalizeSchema(TaskComment));
exports.TaskField = mongoose.model('TaskField', normalizeSchema(TaskField));
exports.Token = mongoose.model('Token', normalizeSchema(Token));
