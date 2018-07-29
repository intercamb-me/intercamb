'use strict';

const _ = require('lodash');

exports.getOptions = (req) => {
  const populateByPath = {};
  const selection = [];
  if (req.query.populate) {
    const fields = req.query.populate.split(' ');
    _.forEach(fields, (field) => {
      populateByPath[field] = {path: field, select: []};
    });
  }
  if (req.query.select) {
    const fields = req.query.select.split(' ');
    _.forEach(fields, (field) => {
      const separatorIndex = field.lastIndexOf('.');
      if (separatorIndex >= 0) {
        const path = field.substring(0, separatorIndex);
        if (populateByPath[path]) {
          const select = field.substring(separatorIndex + 1, field.length);
          populateByPath[path].select.push(select);
        }
      } else {
        selection.push(field);
      }
    });
  }
  return {
    select: selection,
    populate: _.toArray(populateByPath),
  };
};
