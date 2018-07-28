'use strict';

const _ = require('lodash');

exports.getOptions = (req) => {
  let populate;
  if (req.query.populate) {
    populate = [];
    const populateByPath = {};
    const fields = req.query.populate.split(' ');
    _.forEach(fields, (field) => {
      const fieldSplit = field.split('.');
      const path = fieldSplit[0];
      populateByPath[path] = populateByPath[path] || [];
      if (fieldSplit.length === 2) {
        const select = fieldSplit[1];
        populateByPath[path].push(select);
      }
    });
    _.forEach(populateByPath, (select, path) => {
      populate.push({path, select: select.join(' ')});
    });
  }
  return {
    populate,
    select: req.query.select,
  };
};
