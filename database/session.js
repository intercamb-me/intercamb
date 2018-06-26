'use strict';

const settings = require('configs/settings');
const errors = require('utils/errors');
const {Account} = require('models');
const {logger} = require('@ayro/commons');
const redis = require('redis');
const JwtRedis = require('jsonwebtoken-redis');
const Promise = require('bluebird');

const SCOPE_ACCOUNT = 'account';
const SCOPE_USER = 'user';

const redisClient = redis.createClient({
  host: settings.redis.host,
  port: settings.redis.port,
  password: settings.redis.password,
});

const jwtRedis = new JwtRedis(redisClient, {
  prefix: settings.session.prefix,
  expiresKeyIn: settings.session.expiresIn,
  promiseImpl: Promise,
});

exports.createToken = async (account) => {
  try {
    const decoded = await jwtRedis.sign({
      scope: SCOPE_ACCOUNT,
      account: account.id,
    }, settings.session.secret, {
      keyid: settings.session.keyId,
    });
    return decoded;
  } catch (err) {
    if (err instanceof JwtRedis.TokenExpiredError) {
      throw errors.authorizationError('token_expired', 'Token expired');
    }
    throw err;
  }
};

exports.decodeToken = async (token) => {
  const result = {};
  try {
    if (token) {
      const decoded = await jwtRedis.decode(token, {complete: true});
      if (decoded.header.kid === settings.session.keyId) {
        const payload = await jwtRedis.verify(token, settings.session.secret);
        switch (payload.scope) {
          case SCOPE_ACCOUNT:
            result.account = new Account({id: payload.account});
            break;
          default:
            // Nothing to do...
            break;
        }
      }
    }
  } catch (err) {
    if (err instanceof JwtRedis.TokenExpiredError) {
      throw errors.authorizationError('token_expired', 'Token expired');
    }
    logger.warn('Could not decode jwt token', err);
  }
  return result;
};

exports.touchToken = async (token) => {
  if (token) {
    await jwtRedis.touch(token);
  }
};

exports.destroyToken = async (token) => {
  if (token) {
    await jwtRedis.destroy(token);
  }
};
