'use strict';

const Promise = require('bluebird');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const ENCODING_HEX = 'hex';

const randomBytesAsync = Promise.promisify(crypto.randomBytes);
const hashAsync = Promise.promisify(bcrypt.hash);
const compareAsync = Promise.promisify(bcrypt.compare);

exports.token = async () => {
  const buffer = await randomBytesAsync(20);
  return buffer.toString(ENCODING_HEX);
};

exports.hash = async (data) => {
  return hashAsync(data, 10);
};

exports.compare = async (data, hash) => {
  return compareAsync(data, hash);
};
