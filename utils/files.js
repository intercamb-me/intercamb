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
const ACCOUNT_IMAGE_DIMENSION = 160;
const CLIENT_PHOTO_DIMENSION = 160;

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

async function uploadToS3(sourcePath, file, options, publicMode) {
  const relativePath = path.join(file.relativeDir, file.name);
  if (settings.env === constants.environments.PRODUCTION) {
    const cdnUrl = publicMode ? settings.publicCDNUrl : settings.privateCDNUrl;
    const bucket = publicMode ? settings.publicS3Bucket : settings.privateS3Bucket;
    const sourceDir = path.dirname(sourcePath);
    const sourceFileName = path.basename(sourcePath);
    const finalPath = path.join(sourceDir, `${sourceFileName}_${Date.now()}`);
    if (await isImage(file)) {
      await processImage(sourcePath, finalPath, options);
    }
    await s3.putObject({
      Bucket: bucket,
      Key: relativePath,
      Body: await fs.readFileAsync(finalPath),
      ContentType: file.mimeType,
    }).promise();
    await fs.unlinkAsync(sourcePath);
    await fs.unlinkAsync(finalPath);
    return `${cdnUrl}/${relativePath}`;
  }

  const finalDir = path.join(settings.mediaPath, file.relativeDir);
  const finalPath = path.join(settings.mediaPath, relativePath);
  await mkdirp.mkdirpAsync(finalDir);
  if (await isImage(file)) {
    await processImage(sourcePath, finalPath, options);
    await fs.unlinkAsync(sourcePath);
  } else {
    await fs.renameAsync(sourcePath, finalPath);
  }
  return `${settings.mediaUrl}/${relativePath}`;
}

async function deleteFromS3(relativePath, publicMode) {
  if (settings.env === constants.environments.PRODUCTION) {
    const bucket = publicMode ? settings.publicS3Bucket : settings.privateS3Bucket;
    const objects = await s3.listObjectsV2({
      Bucket: bucket,
      Prefix: relativePath,
    }).promise();
    if (objects.Contents.length === 0) {
      return;
    }
    const deleteParams = {
      Bucket: bucket,
      Delete: {
        Objects: [],
      },
    };
    objects.Contents.forEach(({Key}) => {
      deleteParams.Delete.Objects.push({Key});
    });
    await s3.deleteObjects(deleteParams).promise();
    if (objects.Contents.IsTruncated) {
      await deleteFromS3(relativePath, publicMode);
    }
  } else {
    const finalPath = path.join(settings.mediaPath, relativePath);
    await fs.unlinkAsync(finalPath);
  }
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
  return uploadToS3(logoPath, file, options, true);
};

exports.uploadAccountImage = async (account, imagePath) => {
  const file = {
    name: `image_${Date.now()}.png`,
    relativeDir: path.join('accounts', account.id),
    mimeType: 'image/png',
  };
  const options = {
    png: true,
    dimension: ACCOUNT_IMAGE_DIMENSION,
  };
  return uploadToS3(imagePath, file, options, true);
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
  return uploadToS3(photoPath, file, options, true);
};

exports.deleteClientMedia = async (client) => {
  const relativePath = path.join('clients', client.id);
  await deleteFromS3(relativePath, false);
};

exports.uploadTaskAttachment = async (task, taskFile) => {
  const file = {
    name: `attachment_${Date.now()}${path.extname(taskFile.name)}`,
    relativeDir: path.join('clients', task.client.toString(), 'tasks', task.id),
    mimeType: taskFile.mimeType,
  };
  await uploadToS3(taskFile.path, file);
  return file.name;
};

exports.getTaskAttachment = async (task, attachment) => {
  const relativePath = path.join('clients', task.client.toString(), 'tasks', task.id, attachment.file);
  if (settings.env === constants.environments.PRODUCTION) {
    return s3.getObject({
      Bucket: settings.privateS3Bucket,
      Key: relativePath,
    }).promise();
  }
  return fs.readFileAsync(path.join(settings.mediaPath, relativePath));
};

exports.deleteTaskMedia = async (task) => {
  const relativePath = path.join('clients', task.client.toString(), 'tasks', task.id);
  await deleteFromS3(relativePath, false);
};
