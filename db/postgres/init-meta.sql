-- PostreSQL 9.1

CREATE ROLE master WITH CREATEDB CREATEROLE LOGIN REPLICATION PASSWORD='qwerty123';
-- su postgres
-- mkdir /home/master/Projects/postgres/.ts/ts_master
-- chmod o+w /home/master/Projects/postgres/.ts/ts_master
CREATE TABLESPACE ts_master OWNER master LOCATION '/home/master/Projects/postgres/.ts/ts_master';
CREATE DATABASE master WITH OWNER master ENCODING='UTF8' TABLESPACE ts_master;
-- CREATE LANGUAGE plpgsql;