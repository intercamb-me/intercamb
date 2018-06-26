'use strict';

const {Client} = require('models');

exports.createClient = async (company, data) => {
  const client = new Client(data);
  client.company = company.id;
  client.registration_date = new Date();
  return client.save();
};

exports.updateClient = async () => {

};

exports.removeClient = async () => {

};
