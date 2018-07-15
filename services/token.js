'use strict';

const tokenQueries = require('database/queries/token');
const errors = require('utils/errors');
const {Token} = require('models');
const dateFns = require('date-fns');

exports.getToken = async (id) => {
  const token = await tokenQueries.findToken((query) => {
    query.where('_id', id);
    query.populate('company', {name: 1, logo_url: 1, primary_color: 1, text_color: 1});
  });
  if (token.expiration_date < new Date()) {
    await Token.remove({_id: token.id});
    throw errors.notFoundError('token_not_found', 'Token not found');
  }
  return token;
};

exports.createToken = async (account, company, identifier, type) => {
  const token = new Token({
    identifier,
    type,
    creator: account.id,
    company: company.id,
    expiration_date: dateFns.addMonths(new Date(), 1),
    registration_date: new Date(),
  });
  return token.save();
};

exports.removeToken = async (token) => {
  await Token.remove({_id: token.id});
};
