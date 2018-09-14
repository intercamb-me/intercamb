'use strict';

const _ = require('lodash');

function fillPopulate(populate, populateStr) {
  if (!populateStr) {
    return;
  }
  const populateTrees = [];
  _.forEach(populateStr.split(' '), (populatePath) => {
    const populateTree = {};
    let currentPath = null;
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

function fixSort(sort) {
  if (!sort) {
    return undefined;
  }
  const fixedSort = {};
  _.forEach(sort.split(' '), (sortStr) => {
    const sortSplit = sortStr.split(':');
    const field = sortSplit[0];
    if (sortSplit.length > 1) {
      const order = sortSplit[1];
      fixedSort[field] = order === 'desc' ? -1 : 1;
    } else {
      fixedSort[field] = 1;
    }
  });
  return fixedSort;
}

exports.getOptions = (req) => {
  const populate = {};
  const select = [];
  fillPopulate(populate, req.query.populate);
  fillSelect(select, populate, req.query.select);
  const options = {
    select,
    populate: fixPopulate(populate),
    sort: fixSort(req.query.sort),
    last: req.query.last,
  };
  if (req.query.limit) {
    options.limit = parseInt(req.query.limit);
  }
  return options;
};
