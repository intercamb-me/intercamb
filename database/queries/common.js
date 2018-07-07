'use strict';

const _ = require('lodash');

exports.fillQuery = (promise, options) => {
  if (!_.has(options, 'require')) {
    options.require = true;
  }
  if (options.populate) {
    promise.populate(options.populate);
  }
  if (options.select) {
    promise.select(options.select);
  }
  if (options.sort) {
    promise.sort(options.sort);
  }
  if (options.lean) {
    promise.lean();
  }
};
