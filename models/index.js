'use strict';

const settings = require('configs/settings');
const constants = require('utils/constants');
const {logger} = require('@ayro/commons');
const mongoose = require('mongoose');
const Promise = require('bluebird');
const _ = require('lodash');

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

const Client = new Schema({
  company: {type: ObjectId, ref: 'Company', required: true},
  forename: {type: String, required: true},
  surname: {type: String, required: true},
  email: {type: String},
  phone: {type: String},
  photo_url: {type: String},
  registration_date: {type: Date, required: true},
  address: {type: new Schema({
    public_place: {type: String},
    number: {type: Number},
    complement: {type: String},
    neighborhood: {type: String},
    city: {type: String},
    state: {type: String},
    zip_code: {type: String},
  }, {_id: false})},
  personal_data: {type: new Schema({
    nationality: {type: String},
    place_of_birth: {type: new Schema({
      city: {type: String},
      state: {type: String},
    }, {_id: false})},
    identity_card: {type: new Schema({
      number: {type: String},
      issuing_authority: {type: String},
      state: {type: String},
    }, {_id: false})},
    cpf_number: {type: String},
    passport_number: {type: String},
    birthdate: {type: Date},
    gender: {type: String},
    civil_state: {type: String},
    number_of_children: {type: Number},
  }, {_id: false})},
  family_data: {type: new Schema({
    father: {type: new Schema({
      name: {type: String},
      education_level: {type: String},
      occupation: {type: String},
      employment_situation: {type: String},
    }, {_id: false})},
    mother: {type: new Schema({
      name: {type: String},
      education_level: {type: String},
      occupation: {type: String},
      employment_situation: {type: String},
    }, {_id: false})},
  }, {_id: false})},
  academic_data: {type: new Schema({
    high_school: {type: new Schema({
      school: {type: String},
      city: {type: String},
      state: {type: String},
      conclusion_year: {type: String},
    }, {_id: false})},
    higher_education: {type: new Schema({
      institution: {type: String},
      course: {type: String},
      city: {type: String},
      state: {type: String},
      conclusion_year: {type: String},
    }, {_id: false})},
  }, {_id: false})},
  intended_course: {type: new Schema({
    name: {type: String},
    institution: {type: String},
    preferred_shift: {type: String},
    alternative_shift: {type: String},
  }, {_id: false})},
  additional_information: {type: new Schema({
    disabilities: {type: String},
    arrival_date: {type: String},
  }, {_id: false})},
});

exports.Account = mongoose.model('Account', normalizeSchema(Account, (account) => {
  delete account.password;
}));
exports.Company = mongoose.model('Company', normalizeSchema(Company));
exports.Client = mongoose.model('Client', normalizeSchema(Client));
