'use strict';

const settings = require('configs/settings');
const util = require('util');

function ApiError(status, code, message, cause) {
  if (!cause && ApiError.super_.captureStackTrace) {
    ApiError.super_.captureStackTrace(this, this.constructor);
  } else if (cause) {
    this.stack = cause.stack;
  }
  this.name = this.constructor.name;
  this.status = status;
  this.code = code;
  this.message = message;
  this.cause = cause;
  this.json = () => {
    const json = {status: this.status, code: this.code, message: this.message};
    if (settings.debug === true && cause) {
      json.cause = cause.message;
    }
    return json;
  };
  this.toString = () => this.message;
}
util.inherits(ApiError, Error);

exports.apiError = (code, message, cause) => {
  return new ApiError(400, code, message, cause);
};

exports.authenticationError = (code, message, cause) => {
  return new ApiError(401, code, message, cause);
};

exports.authorizationError = (code, message, cause) => {
  return new ApiError(403, code, message, cause);
};

exports.notFoundError = (code, message, cause) => {
  return new ApiError(404, code, message, cause);
};

exports.internalError = (message, cause) => {
  return new ApiError(500, 'internal_error', message, cause);
};

exports.respondWithError = (res, err) => {
  if (err instanceof ApiError) {
    res.status(err.status).json(err.json());
  } else {
    const internal = this.internalError(err.message, err);
    res.status(internal.status).json(internal.json());
  }
};
