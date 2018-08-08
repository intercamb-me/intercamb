'use strict';

const queries = require('database/queries');
const errors = require('utils/errors');
const files = require('utils/files');
const cryptography = require('utils/cryptography');
const {Account} = require('models');
const _ = require('lodash');

const DEFAULT_IMAGE_URL = 'https://cdn.intercamb.me/images/account_default_image.png';
const ALLOWED_ATTRS = ['first_name', 'last_name', 'email'];

exports.getAccount = async (id, options) => {
  return queries.get(Account, id, options);
};

exports.createAccount = async (data, company) => {
  if (!data.first_name) throw errors.apiError('account_first_name_required', 'First name required');
  if (!data.last_name) throw errors.apiError('account_last_name_required', 'Last name required');
  if (!data.email) throw errors.apiError('account_email_required', 'Email required');
  if (!data.password) throw errors.apiError('account_password_required', 'Password required');
  const accountWithEmail = await queries.find(Account, {email: data.email}, {require: false});
  if (accountWithEmail) {
    throw errors.apiError('account_already_exists', 'Account already exists');
  }
  const hash = await cryptography.hash(data.password);
  const account = new Account({
    first_name: data.first_name,
    last_name: data.last_name,
    email: data.email,
    password: hash,
    image_url: DEFAULT_IMAGE_URL,
    registration_date: new Date(),
  });
  if (company) {
    account.company = company.id;
  }
  return account.save();
};

exports.updateAccount = async (account, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  const loadedAccount = await queries.get(Account, account.id);
  loadedAccount.set(attrs);
  return loadedAccount.save();
};

exports.updateAccountImage = async (account, imageFile) => {
  const loadedAccount = await queries.get(Account, account.id);
  const imageUrl = await files.uploadAccountImage(loadedAccount, imageFile.path);
  loadedAccount.image_url = imageUrl;
  return loadedAccount.save();
};

exports.removeAccount = async () => {

};

exports.authenticate = async (email, password) => {
  const account = await queries.find(Account, {email});
  const match = await cryptography.compare(password, account.password);
  if (!match) {
    throw errors.apiError('wrong_password', 'Wrong account password');
  }
  return account;
};
