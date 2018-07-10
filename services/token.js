'use strict';

const cryptography = require('utils/cryptography');
const {Token} = require('models');
const dateFns = require('date-fns');

exports.createToken = async (account, company, identifier, type) => {
  const token = new Token({
    creator: account.id,
    company: company.id,
    identifier: identifier,
    type: type,
    code: await cryptography.token(),
    expiration_date: dateFns.addMonths(new Date(), 1),
    registration_date: new Date(),
  });
  return token.save();
};
