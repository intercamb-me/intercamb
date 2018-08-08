'use strict';

const queries = require('database/queries');
const errors = require('utils/errors');
const {Token} = require('models');
const dateFns = require('date-fns');

exports.getToken = async (id) => {
  const token = await queries.get(Token, id, {
    populate: {
      path: 'company',
      select: 'name logo_url primary_color text_color',
      populate: {path: 'institutions'},
    }
  });
  if (token.expiration_date < new Date()) {
    await Token.remove({_id: token.id});
    throw errors.notFoundError('token_expired', 'Token expired');
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
