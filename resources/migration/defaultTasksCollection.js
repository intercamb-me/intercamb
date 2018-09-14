'use strict';

require('app-module-path/cwd');

const {DefaultTask} = require('models');
const mongoose = require('mongoose');

const {Schema} = mongoose;
const {ObjectId} = Schema.Types;

const OldChecklistItem = new Schema({
  name: String,
  done: Boolean,
}, {_id: false});

const OldTaskChecklist = new Schema({
  title: String,
  items: [OldChecklistItem],
}, {_id: false});

const OldTaskField = new Schema({
  name: String,
  type: String,
  value: String,
}, {_id: false});

const OldDefaultTask = new Schema({
  checklists: [OldTaskChecklist],
  fields: [OldTaskField],
}, {_id: false});

const OldCompanySchema = new Schema({
  name: String,
  default_tasks: [OldDefaultTask],
}, {collection: 'companies'});

const OldCompany = mongoose.model('OldCompany', OldCompanySchema);

(async function () {
  const companies = await OldCompany.find().exec();
  const defaultTasks = [];
  companies.forEach((company) => {
    company.default_tasks.forEach((oldDefaultTask) => {
      const defaultTask = new DefaultTask(oldDefaultTask);
      defaultTask.company = company.id;
      defaultTask.registration_date = new Date();
      defaultTasks.push(defaultTask);
    });
  });
  await DefaultTask.insertMany(defaultTasks);
  process.exit(1);
})();
