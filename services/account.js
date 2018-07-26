'use strict';

const accountQueries = require('database/queries/account');
const errors = require('utils/errors');
const files = require('utils/files');
const cryptography = require('utils/cryptography');
const {Account} = require('models');
const _ = require('lodash');

const DEFAULT_IMAGE_URL = 'https://cdn.ayro.io/images/account_default_logo.png';
const ALLOWED_ATTRS = ['first_name', 'last_name', 'email'];

exports.getAccount = async (id, options) => {
  return accountQueries.getAccount(id, options);
};

exports.createAccount = async (firstName, lastName, email, password) => {
  const accountWithEmail = await accountQueries.findAccount({email}, {require: false});
  if (accountWithEmail) {
    throw errors.apiError('account_already_exists', 'Account already exists');
  }
  const hash = await cryptography.hash(password);
  const account = new Account({
    email,
    first_name: firstName,
    last_name: lastName,
    password: hash,
    image_url: DEFAULT_IMAGE_URL,
    registration_date: new Date(),
  });
  return account.save();
};

exports.updateAccount = async (account, data) => {
  const attrs = _.pick(data, ALLOWED_ATTRS);
  const loadedAccount = await accountQueries.getAccount(account.id);
  loadedAccount.set(attrs);
  return loadedAccount.save();
};

exports.updateAccountImage = async (account, imageFile) => {
  const loadedAccount = await accountQueries.getAccount(account.id);
  const imageUrl = await files.uploadAccountImage(loadedAccount, imageFile.path);
  loadedAccount.image_url = imageUrl;
  return loadedAccount.save();
};

exports.removeAccount = async () => {

};

exports.authenticate = async (email, password) => {
  const account = await accountQueries.findAccount({email});
  const match = await cryptography.compare(password, account.password);
  if (!match) {
    throw errors.apiError('wrong_password', 'Wrong account password');
  }
  return account;
};
