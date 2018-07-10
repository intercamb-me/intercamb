'use strict';

const Promise = require('bluebird');
const bcrypt = require('bcrypt');

const hashAsync = Promise.promisify(bcrypt.hash);
const compareAsync = Promise.promisify(bcrypt.compare);

exports.hash = async (data) => {
  return hashAsync(data, 10);
};

exports.compare = async (data, hash) => {
  return compareAsync(data, hash);
};
