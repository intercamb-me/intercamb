'use strict';

const constants = require('utils/constants');
const path = require('path');
const yaml = require('yamljs');
const mkdirp = require('mkdirp');
const _ = require('lodash');

const config = yaml.load(path.resolve('config.yml'));

exports.env = _.get(config, 'app.env', constants.environments.DEVELOPMENT);
exports.port = _.get(config, 'app.port', 3000);
exports.debug = _.get(config, 'app.debug', false);

exports.publicUrl = this.env === constants.environments.PRODUCTION ? 'https://api.intercamb.me' : `http://localhost:${this.port}`;
exports.publicPath = _.get(config, 'app.publicPath', path.resolve('public'));

exports.uploadsUrl = `${this.publicUrl}/uploads`;
exports.uploadsPath = path.join(this.publicPath, 'uploads');

exports.mediaUrl = `${this.publicUrl}/media`;
exports.mediaPath = path.join(this.publicPath, 'media');

exports.publicS3Bucket = 'intercamb-public';
exports.publicCDNUrl = 'https://public.intercamb.me';

exports.mediaS3Bucket = 'intercamb-media';
exports.mediaCDNUrl = 'https://media.intercamb.me';

exports.session = {
  prefix: 'session:',
  keyId: _.get(config, 'session.keyId'),
  secret: _.get(config, 'session.secret'),
  expiresIn: _.get(config, 'session.expiresIn', '24 hours'),
};

exports.mongo = {
  host: _.get(config, 'mongo.host', 'localhost'),
  port: _.get(config, 'mongo.port', 27017),
  debug: _.get(config, 'mongo.debug', false),
  schema: _.get(config, 'mongo.schema', 'intercamb'),
  username: _.get(config, 'mongo.username'),
  password: _.get(config, 'mongo.password'),
};

exports.redis = {
  host: _.get(config, 'redis.host', 'localhost'),
  port: _.get(config, 'redis.port', 6379),
  password: _.get(config, 'redis.password'),
};

exports.aws = {
  keyId: _.get(config, 'aws.keyId'),
  secret: _.get(config, 'aws.secret'),
};

mkdirp.sync(this.publicPath);
mkdirp.sync(this.uploadsPath);
mkdirp.sync(this.mediaPath);

if (this.env === constants.environments.PRODUCTION) {
  if (!this.aws.keyId) {
    throw new Error('Property aws.keyId is required');
  }
  if (!this.aws.secret) {
    throw new Error('Property aws.secret is required');
  }
  process.env.AWS_ACCESS_KEY_ID = this.aws.keyId;
  process.env.AWS_SECRET_ACCESS_KEY = this.aws.secret;
}
if (!this.session.keyId) {
  throw new Error('Property session.keyId is required');
}
if (!this.session.secret) {
  throw new Error('Property session.secret is required');
}
