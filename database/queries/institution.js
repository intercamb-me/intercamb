'use strict';

const {Institution} = require('models');
const errors = require('utils/errors');
const queryCommon = require('database/queries/common');
const _ = require('lodash');

function throwInstitutionNotFoundIfNeeded(institution, options) {
  if (!institution && options.require) {
    throw errors.notFoundError('institution_not_found', 'Institution not found');
  }
}

exports.getInstitution = async (id, options) => {
  const queryBuilder = Institution.findById(id);
  const filledOptions = queryCommon.fillQuery(queryBuilder, options);
  const institution = await queryBuilder.exec();
  throwInstitutionNotFoundIfNeeded(institution, filledOptions);
  return institution;
};

exports.findInstitution = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = Institution.findOne();
    query(queryBuilder);
  } else {
    queryBuilder = Institution.findOne(query);
  }
  const filledOptions = queryCommon.fillQuery(queryBuilder, options);
  const institution = await queryBuilder.exec();
  throwInstitutionNotFoundIfNeeded(institution, filledOptions);
  return institution;
};

exports.findInstitutions = async (query, options) => {
  let queryBuilder;
  if (_.isFunction(query)) {
    queryBuilder = Institution.find();
    query(queryBuilder);
  } else {
    queryBuilder = Institution.find(query);
  }
  queryCommon.fillQuery(queryBuilder, options);
  return queryBuilder.exec();
};
