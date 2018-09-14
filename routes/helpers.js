'use strict';

const _ = require('lodash');

function fillPopulate(populate, populateStr) {
  if (!populateStr) {
    return;
  }
  const populateTrees = [];
  _.forEach(populateStr.split(' '), (populatePath) => {
    const populateTree = {};
    let currentPath = null;s
    _.forEach(populatePath.split('.'), (field) => {
      currentPath = currentPath ? `${currentPath}.populate[${field}]` : field;
      _.set(populateTree, currentPath, {path: field.replace(/>/g, '.'), select: []});
    });
    populateTrees.push(populateTree);
  });
  _.merge(populate, ...populateTrees);
}

function fillSelect(select, populate, selectStr) {
  if (!selectStr) {
    return;
  }
  _.forEach(selectStr.split(' '), (selectPath) => {
    const separatorIndex = selectPath.lastIndexOf('.');
    if (separatorIndex >= 0) {
      const path = selectPath.substring(0, separatorIndex);
      const selection = selectPath.substring(separatorIndex + 1, selectPath.length);
      let currentPath = null;
      _.forEach(path.split('.'), (field) => {
        currentPath = currentPath ? `${currentPath}.populate[${field}]` : field;
      });
      _.get(populate, currentPath).select.push(selection);
    } else {
      select.push(selectPath);
    }
  });
}

function fixPopulate(populate) {
  const fixedPopulate = _.toArray(populate);
  _.forEach(fixedPopulate, (currentPopulate) => {
    if (currentPopulate.populate) {
      currentPopulate.populate = fixPopulate(currentPopulate.populate);
    }
  });
  return fixedPopulate;
}

exports.getOptions = (req) => {
  const populate = {};
  const select = [];
  fillPopulate(populate, req.query.populate);
  fillSelect(select, populate, req.query.select);
  return {
    select,
    populate: fixPopulate(populate),
    sort: req.query.sort,
    last: req.query.last,
    limit: req.query.limit,
  };
};
