'use strict';

const settings = require('configs/settings');
const constants = require('utils/constants');
const Promise = require('bluebird');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const AWS = require('aws-sdk');

Promise.promisifyAll(mkdirp);
Promise.promisifyAll(fs);

const COMPANY_LOGO_DIMENSION = 160;
const ACCOUNT_ICON_DIMENSION = 160;
const CLIENT_PHOTO_DIMENSION = 128;

const s3 = new AWS.S3();

async function isImage(file) {
  return file.mimeType.startsWith('image');
}

async function processImage(inputFile, outputFile, options) {
  const transformer = sharp(inputFile);
  if (options) {
    if (options.dimension) {
      transformer.resize(options.dimension);
    }
    if (options.png) {
      transformer.png();
    }
  }
  return transformer.toFile(outputFile);
}

async function uploadMedia(sourcePath, file, options) {
  let fileUrl = null;
  const relativePath = path.join(file.relativeDir, file.name);
  if (settings.env === constants.environments.PRODUCTION) {
    const sourceDir = path.dirname(sourcePath);
    const sourceFileName = path.basename(sourcePath);
    const finalPath = path.join(sourceDir, `${sourceFileName}_${Date.now()}`);
    if (await isImage(file)) {
      await processImage(sourcePath, finalPath, options);
    }
    await s3.putObject({
      Bucket: settings.mediaS3Bucket,
      Key: relativePath,
      Body: await fs.readFileAsync(finalPath),
      ContentType: file.mimeType,
    }).promise();
    fileUrl = `${settings.mediaCDNUrl}/${relativePath}`;
    await fs.unlinkAsync(sourcePath);
    await fs.unlinkAsync(finalPath);
  } else {
    const finalDir = path.join(settings.mediaPath, file.relativeDir);
    const finalPath = path.join(settings.mediaPath, relativePath);
    if (await isImage(file)) {
      await mkdirp.mkdirpAsync(finalDir);
      await processImage(sourcePath, finalPath, options);
      await fs.unlinkAsync(sourcePath);
    } else {
      await fs.renameAsync(sourcePath, finalPath);
    }
    fileUrl = `${settings.mediaUrl}/${relativePath}`;
  }
  return fileUrl;
}

exports.uploadCompanyLogo = async (company, logoPath) => {
  const file = {
    name: `logo_${Date.now()}.png`,
    relativeDir: path.join('companies', company.id),
    mimeType: 'image/png',
  };
  const options = {
    png: true,
    dimension: COMPANY_LOGO_DIMENSION,
  };
  return uploadMedia(logoPath, file, options);
};

exports.uploadAccountIcon = async (account, iconPath) => {
  const file = {
    name: `icon_${Date.now()}.png`,
    relativeDir: path.join('accounts', account.id),
    mimeType: 'image/png',
  };
  const options = {
    png: true,
    dimension: ACCOUNT_ICON_DIMENSION,
  };
  return uploadMedia(iconPath, file, options);
};

exports.uploadClientPhoto = async (client, photoPath) => {
  const file = {
    name: `photo_${Date.now()}.png`,
    relativeDir: path.join('clients', client.id),
    mimeType: 'image/png',
  };
  const options = {
    png: true,
    dimension: CLIENT_PHOTO_DIMENSION,
  };
  return uploadMedia(photoPath, file, options);
};

exports.uploadClientFile = async (client, clientFile) => {
  const file = {
    name: `upload_${Date.now()}${path.extname(clientFile.name)}`,
    relativeDir: path.join('clients', client.id, 'uploads'),
    mimeType: clientFile.mimeType,
  };
  return uploadMedia(clientFile.path, file);
};
