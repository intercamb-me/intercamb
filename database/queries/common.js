'use strict';

const _ = require('lodash');

exports.fillQuery = (query, options) => {
  const filledOptions = options || {};
  if (!_.has(filledOptions, 'require')) {
    filledOptions.require = true;
  }
  if (filledOptions.populate) {
    query.populate(filledOptions.populate);
  }
  if (filledOptions.select) {
    query.select(filledOptions.select);
  }
  if (filledOptions.sort) {
    query.sort(filledOptions.sort);
  }
  if (filledOptions.lean) {
    query.lean();
  }
  return filledOptions;
};
