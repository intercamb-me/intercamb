'use strict';

const settings = require('configs/settings');
const {accountAuthenticated, decodeToken} = require('routes/middlewares');
const accountService = require('services/account');
const session = require('database/session');
const errors = require('utils/errors');
const logger = require('utils/logger');
const multer = require('multer');

const upload = multer({dest: settings.uploadsPath});

async function createAccount(req, res) {
  try {
    const account = await accountService.createAccount(req.body.first_name, req.body.last_name, req.body.email, req.body.password);
    res.json(account);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function getAccount(req, res) {
  try {
    await decodeToken(req);
    if (req.account) {
      const account = await accountService.getAccount(req.account.id);
      res.json(account);
    } else {
      res.json(null);
    }
  } catch (err) {
    if (err.code === 'token_expired') {
      res.json(null);
      return;
    }
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateAccount(req, res) {
  try {
    const account = await accountService.updateAccount(req.account, req.body);
    res.json(account);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function updateAccountIcon(req, res) {
  try {
    const account = await accountService.updateIcon(req.account, req.file);
    res.json(account);
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function login(req, res) {
  try {
    const account = await accountService.authenticate(req.body.email, req.body.password);
    const token = await session.createToken(account);
    res.json({token, account});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

async function logout(req, res) {
  try {
    if (req.token) {
      await session.destroyToken(req.token);
    }
    res.json({});
  } catch (err) {
    logger.error(err);
    errors.respondWithError(res, err);
  }
}

module.exports = (router, app) => {
  router.post('', createAccount);
  router.get('/current', getAccount);
  router.put('/current', accountAuthenticated, updateAccount);
  router.put('/current/icon', [accountAuthenticated, upload.single('icon')], updateAccountIcon);
  router.post('/login', login);
  router.post('/logout', logout);
  app.use('/accounts', router);
};
