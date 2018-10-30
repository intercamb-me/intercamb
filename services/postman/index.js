'use strict';

const settings = require('configs/settings');
const emails = require('services/postman/emails');
const path = require('path');
const fs = require('fs');
const util = require('util');
const rimraf = require('rimraf');
const mkdirp = require('mkdirp');
const nunjucks = require('nunjucks');
const juice = require('juice');
const Mailgun = require('mailgun-js');
const Promise = require('bluebird');
const _ = require('lodash');

const INVITATION_TEMPLATE = 'invitation';

const mailClient = new Mailgun({apiKey: settings.postman.apiKey, domain: settings.postman.domain});

const templates = {};
const templatesDir = path.join(__dirname, 'templates');
const inlineTemplatesDir = path.join(templatesDir, 'inline');
rimraf.sync(inlineTemplatesDir);
mkdirp.sync(inlineTemplatesDir);
const env = new nunjucks.Environment(new nunjucks.FileSystemLoader(inlineTemplatesDir));
fs.readdirSync(templatesDir).forEach((templateName) => {
  if (_.endsWith(templateName, 'tpl')) {
    const template = fs.readFileSync(path.join(templatesDir, templateName));
    const style = fs.readFileSync(path.join(templatesDir, 'styles/main.css'));
    const inlineTemplate = juice.inlineContent(template.toString(), style.toString());
    fs.writeFileSync(path.join(inlineTemplatesDir, templateName), inlineTemplate);
    templates[templateName.replace('.tpl', '')] = env.getTemplate(templateName);
  }
});

function render(template, variables) {
  return new Promise((resolve, reject) => {
    template.render(variables, (err, email) => {
      if (err) {
        reject(err);
      } else {
        resolve(email);
      }
    });
  });
}

async function renderAndSend(toEmail, templateName, subjectContext, templateContext) {
  let {subject} = emails[templateName];
  if (subjectContext) {
    subjectContext.unshift(subject);
    subject = util.format.apply(this, subjectContext);
  }
  const template = templates[templateName];
  const sender = this.formatEmail(settings.postman.sender.name, settings.postman.sender.email);
  const renderization = await render(template, templateContext);
  await this.send(sender, toEmail, subject, renderization);
}

exports.formatEmail = (name, email) => {
  return `${name} <${email}>`;
};

exports.renderString = async (text, context) => {
  return new Promise((resolve, reject) => {
    nunjucks.renderString(text, context, (err, renderization) => {
      if (err) {
        reject(err);
      } else {
        resolve(renderization);
      }
    });
  });
};

exports.send = async (from, to, subject, html) => {
  return new Promise((resolve, reject) => {
    mailClient.messages().send({from, to, subject, html}, (err, body) => {
      if (err) {
        reject(err);
      } else {
        resolve(body);
      }
    });
  });
};

exports.invite = async (account, company, invitation) => {
  const subjectContext = [account.getFullName()];
  const templateContext = {account, company, invitation};
  await renderAndSend(invitation.email, INVITATION_TEMPLATE, subjectContext, templateContext);
};
