'use strict';

const accountQueries = require('database/queries/account');
const {Account} = require('models');
const errors = require('utils/errors');
const crypt = require('utils/crypt');

const DEFAULT_ICON_URL = 'https://cdn.ayro.io/images/account_default_logo.png';

exports.getAccount = async (id) => {
  return accountQueries.getAccount(id);
};

exports.createAccount = async (firstName, lastName, email, password) => {
  const hash = await crypt.hash(password);
  const account = new Account({
    email,
    first_name: firstName,
    last_name: lastName,
    password: hash,
    icon_url: DEFAULT_ICON_URL,
    registration_date: new Date(),
  });
  return account.save();
};

exports.updateAccount = async () => {

};

exports.updateAccountIcon = async () => {

};

exports.removeAccount = async () => {

};

exports.authenticate = async (email, password) => {
  const account = await accountQueries.findAccount({email});
  const match = await crypt.compare(password, account.password);
  if (!match) {
    throw errors.ayroError('wrong_password', 'Wrong account password');
  }
  return account;
};
