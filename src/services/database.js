// Put your database code here

const database = require('better-sqlite3');//better-sqlite3

const fs = require('fs');
const datadir = './data/';

if (!fs.existsSync(datadir)){
    fs.mkdirSync(datadir);
}

const logdb = new database(datadir+'log.db');//connect or crete database

const statement = logdb.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`);
//^^ initialize database

//return first row
let row = statement.get();

if (row === undefined) {
    console.log('Your database appears to be empty. I will initialize it now.');
    const sqlInit = `
        CREATE TABLE accesslog ( id INTEGER PRIMARY KEY, remoteaddr TEXT, remoteuser TEXT, time TEXT, method TEXT, url TEXT, protocol TEXT, httpversion TEXT, secure TEXT, status TEXT, referer TEXT, useragent TEXT )`;
    logdb.exec(sqlInit)
} else {
    console.log('Log Database exists.')
}
// Export all of the above as a module so that we can use it elsewhere.
module.exports = logdb