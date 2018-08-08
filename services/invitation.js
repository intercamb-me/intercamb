'use strict';

const queries = require('database/queries');
const errors = require('utils/errors');
const {Invitation} = require('models');
const dateFns = require('date-fns');

exports.getInvitation = async (id) => {
  const invitation = await queries.get(Invitation, id);
  if (invitation.expiration_date < new Date()) {
    await Invitation.remove({_id: invitation.id});
    throw errors.notFoundError('invitation_expired', 'Invitation expired');
  }
  return invitation;
};

exports.createInvitation = async (account, company, email) => {
  const invitation = new Invitation({
    email,
    creator: account.id,
    company: company.id,
    expiration_date: dateFns.addMonths(new Date(), 1),
    registration_date: new Date(),
  });
  return invitation.save();
};

exports.removeInvitation = async (invitation) => {
  await Invitation.remove({_id: invitation.id});
};
