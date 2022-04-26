// Put your database code here

const database = require('better-sqlite3');//better-sqlite3
const logdb = new database('./data/db/log.db');//connect or crete database
const statement = logdb.prepare(`SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`);
//^^ initialize database

//return first row
let row = statement.get();

if (row === undefined) {
    console.log('Your database appears to be empty. I will initialize it now.');
    const sqlInit = `
        CREATE TABLE accesslog ( id INTEGER PRIMARY KEY, remoteaddr TEXT, remoteuser TEXT, time TEXT, method TEXT, url TEXT, protocol TEXT, httpversion TEXT, secure TEXT, status TEXT, referer TEXT, useragent TEXT )`;
        // INSERT INTO accesslog (username, password) VALUES ('user1','supersecurepassword'),('test','anotherpassword');
     
    db.exec(sqlInit);
    console.log('Your database has been initialized.');
} else {
    console.log('Database exists.')
}
// Export all of the above as a module so that we can use it elsewhere.
module.exports = db