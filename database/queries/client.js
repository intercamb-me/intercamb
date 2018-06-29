'use strict';

const {Client, Document} = require('models');
const errors = require('utils/errors');
const queryCommon = require('database/queries/common');

function throwClientNotFoundIfNeeded(client, options) {
  if (!client && options.require) {
    throw errors.notFoundError('client_not_found', 'Client not found');
  }
}

function throwDocumentNotFoundIfNeeded(client, options) {
  if (!client && options.require) {
    throw errors.notFoundError('document_not_found', 'Document not found');
  }
}

exports.getClient = async (id, options) => {
  const promise = Client.findById(id);
  queryCommon.fillQuery(promise, options || {});
  const client = await promise.exec();
  throwClientNotFoundIfNeeded(client, options);
  return client;
};

exports.findClient = async (query, options) => {
  const promise = Client.findOne(query);
  queryCommon.fillQuery(promise, options || {});
  const client = await promise.exec();
  throwClientNotFoundIfNeeded(client, options);
  return client;
};

exports.findClients = async (query, options) => {
  const promise = Client.find(query);
  queryCommon.fillQuery(promise, options || {});
  return promise.exec();
};

exports.getDocument = async (id, options) => {
  const promise = Document.findById(id);
  queryCommon.fillQuery(promise, options || {});
  const document = await promise.exec();
  throwDocumentNotFoundIfNeeded(document, options);
  return document;
};

exports.findDocument = async (query, options) => {
  const promise = Document.findOne(query);
  queryCommon.fillQuery(promise, options || {});
  const document = await promise.exec();
  throwDocumentNotFoundIfNeeded(document, options);
  return document;
};

exports.findDocuments = async (query, options) => {
  const promise = Document.find(query);
  queryCommon.fillQuery(promise, options || {});
  return promise.exec();
};

