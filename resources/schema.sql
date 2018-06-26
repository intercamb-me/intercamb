create table company (
  id                int not null auto_increment,
  name              varchar(255) not null,
  logo_url          varchar(255) not null,
  owner_id          int not null,
  registration_date datetime default null,
  primary key (id)
) engine = innodb default charset = utf8;

create table account (
  id                int not null auto_increment,
  name              varchar(255) not null,
  email             varchar(255) default null,
  password          varchar(255) default null,
  icon_url          varchar(255) not null,
  company_id        int default null,
  registration_date datetime default null,
  primary key (id),
  unique key `uq_account_email` (`email`),
  key `fk_account_company_id` (`company_id`),
  constraint `fk_account_company_id` foreign key (`company_id`) references `company` (`id`)
) engine = innodb default charset = utf8;

create table user (
  id                int not null auto_increment,
  name              varchar(255) not null,
  email             varchar(255) default null,
  phone             varchar(15) default null,
  photo_url         varchar(255) not null,
  company_id        int not null,
  registration_date datetime default null,
  primary key (id),
  unique key `uq_user_email` (`email`)
) engine = innodb default charset = utf8;

alter table company add constraint fk_company_owner_id foreign key (owner_id) references account(id);