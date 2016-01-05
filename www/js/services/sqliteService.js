angular.module('sqliteService', [])
.factory('SQLiteService', [
'$log',
'$q',
'$window',
function ($log, $q, $window) {

  var migrate = function(db) {

    var defer = $q.defer(), dbVersion = $window.localStorage.getItem('dbVersion');

    if(dbVersion) {
      dbVersion = parseInt(dbVersion);
      defer.resolve();
    } else {
      dbVersion = 1;
      $window.localStorage.setItem('dbVersion', dbVersion);
      executeVersion1(db);
      defer.resolve();
    }

    return defer.promise;
  }

  var executeVersion1 = function(db) {
    db.executeSql('CREATE TABLE IF NOT EXISTS accounts (id INTEGER PRIMARY KEY, name TEXT, value REAL, icon TEXT, iconColorR INTEGER, iconColorG INTEGER, iconColorB INTEGER);');

    db.executeSql('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT, icon TEXT, iconColorR INTEGER, iconColorG INTEGER, iconColorB INTEGER, transactionType INTEGER, isDeletable INTEGER);');
    db.executeSql("INSERT INTO categories (id, name, icon, iconColorR, iconColorG, iconColorB, transactionType, isDeletable) VALUES (1, 'Transfer', 'mdi mdi-swap-vertical', 0, 255, 0, 1, 0)");
    db.executeSql("INSERT INTO categories (id, name, icon, iconColorR, iconColorG, iconColorB, transactionType, isDeletable) VALUES (2, 'Transfer', 'mdi mdi-swap-vertical', 255, 0, 0, 2, 0)");
    
    db.executeSql('CREATE TABLE IF NOT EXISTS earnings (id INTEGER PRIMARY KEY, description TEXT, value REAL, effectiveDate INTEGER, received INTEGER, accountId INTEGER REFERENCES accounts(id) ON DELETE CASCADE, categoryId INTEGER REFERENCES categories(id) ON DELETE CASCADE);');
    
    db.executeSql('CREATE TABLE IF NOT EXISTS expenses (id INTEGER PRIMARY KEY, description TEXT, value REAL, effectiveDate INTEGER, paid INTEGER, accountId INTEGER REFERENCES accounts(id) ON DELETE CASCADE, categoryId INTEGER REFERENCES categories(id) ON DELETE CASCADE);');
    
    db.executeSql('CREATE VIEW IF NOT EXISTS vw_accounts AS SELECT id, name, value + (SELECT TOTAL(value) FROM earnings WHERE accountId = a.id AND received = 1) - (SELECT TOTAL(value) FROM expenses WHERE accountId = a.id AND paid = 1) AS value, icon, iconColorR, iconColorG, iconColorB FROM accounts a;');
  }

  var execute = function (db, queries) {
    var defer = $q.defer();
    
    db.transaction(function (tx) {
      recursiveExecute(tx, queries, defer, []);
    }, function(transaction, error) {
      $log.error(transaction);
      $log.error(error);
      defer.reject(error);
    });

    return defer.promise;
  }

  var recursiveExecute = function(transaction, queries, defer, results) {
    var query = queries.shift();

    transaction.executeSql(query.query, query.binding, function(tx, result) {
      results.push(result);

      if(queries.length > 0)
        recursiveExecute(tx, queries, defer, results);
      else
        defer.resolve(results.length > 1 ? results : result);
    }, function(error) {
      defer.reject(error);
    });
  };

  return {
    migrate: migrate,
    execute: execute,
    recursiveExecute: recursiveExecute
  };
}]);