'use strict';

const queries = require('database/queries');
const errors = require('utils/errors');
const postman = require('services/postman');
const {Account, Company, Invitation} = require('models');
const dateFns = require('date-fns');

exports.getInvitation = async (id) => {
  const invitation = await queries.get(Invitation, id);
  if (invitation.expiration_date < new Date()) {
    await Invitation.remove({_id: invitation.id});
    throw errors.notFoundError('invitation_expired', 'Invitation expired');
  }
  return invitation;
};

exports.removeInvitation = async (invitation) => {
  await Invitation.remove({_id: invitation.id});
};

exports.invite = async (account, company, email) => {
  const invitation = new Invitation({
    email,
    creator: account.id,
    company: company.id,
    expiration_date: dateFns.addMonths(new Date(), 1),
    registration_date: new Date(),
  });
  try {
    const loadedAccount = await queries.get(Account, account.id);
    const loadedCompany = await queries.get(Company, company.id);
    await invitation.save();
    await postman.invite(loadedAccount, loadedCompany, invitation);
    return invitation;
  } catch (err) {
    await Invitation.remove({_id: invitation.id});
    throw err;
  }
};
