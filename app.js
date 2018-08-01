'use strict';

require('app-module-path/register');

const settings = require('configs/settings');
const routes = require('configs/routes');
const logger = require('utils/logger');
const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');
const bearerToken = require('express-bearer-token');
require('json.date-extensions');

// Parse string to date when call JSON.parse
JSON.useDateParser();

const app = express();

app.set('env', settings.env);
app.set('port', settings.port);

app.use(express.static(settings.publicPath));
app.use(morgan('tiny', {stream: {write: message => logger.console.debug(message)}}));
app.use(bodyParser.json({
  verify: (req, res, buf) => {
    req.rawBody = buf;
  },
}));
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(compression());
app.use(cors());
app.use(bearerToken());

logger.info(`Using ${settings.env} environment settings`);
logger.info(`Debug mode is ${settings.debug ? 'ON' : 'OFF'}`);

routes.configure(express, app);

app.listen(app.get('port'), () => {
  logger.info(`Intercamb.me Backend server is listening on port ${app.get('port')}`);
});
