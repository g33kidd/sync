/*
The MIT License (MIT)
Copyright (c) 2013 Calvin Montgomery
 
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var mysql = require('mysql-libmysqlclient');
var Config = require('./config.js');

// Check if a name is taken
exports.isRegistered = function(name) {
    var db = mysql.createConnectionSync();
    db.connectSync(Config.MYSQL_SERVER, Config.MYSQL_USER,
                   Config.MYSQL_PASSWORD, Config.MYSQL_DB);
    if(!db.connectedSync()) {
        console.log("MySQL Connection Failed");
        return true;
    }
    var query = 'SELECT * FROM registrations WHERE uname="{}"'
        .replace(/\{\}/, name);
    var results = db.querySync(query);
    var rows = results.fetchAllSync();
    db.closeSync();
    return rows.length > 0;
}

// Check if a name is valid
// Valid names are 1-20 characters, alphanumeric and underscores
exports.validateName = function(name) {
    if(name.length > 20)
        return false;
    const VALID_REGEX = /^[a-zA-Z0-9_]+$/;
    return name.match(VALID_REGEX) != null;
}

// Try to register a new account
exports.register = function(name, sha256) {
    if(!exports.validateName(name))
        return false;
    if(exports.isRegistered(name))
        return false;
    var db = mysql.createConnectionSync();
    db.connectSync(Config.MYSQL_SERVER, Config.MYSQL_USER,
                   Config.MYSQL_PASSWORD, Config.MYSQL_DB);
    if(!db.connectedSync()) {
        console.log("MySQL Connection Failed");
        return false;
    }
    var query = 'INSERT INTO registrations VALUES (NULL, "{1}", "{2}", 0)'
        .replace(/\{1\}/, name)
        .replace(/\{2\}/, sha256);
    var results = db.querySync(query);
    db.closeSync();
    return results;
}

// Try to login
exports.login = function(name, sha256) {
    var db = mysql.createConnectionSync();
    db.connectSync(Config.MYSQL_SERVER, Config.MYSQL_USER,
                   Config.MYSQL_PASSWORD, Config.MYSQL_DB);
    if(!db.connectedSync()) {
        console.log("MySQL Connection Failed");
        return false;
    }
    var query = 'SELECT * FROM registrations WHERE uname="{1}" AND pw="{2}"'
        .replace(/\{1\}/, name)
        .replace(/\{2\}/, sha256);
    var results = db.querySync(query);
    var rows = results.fetchAllSync();
    db.closeSync();
    if(rows.length > 0) {
        return rows[0];
    }
    return false;
}
