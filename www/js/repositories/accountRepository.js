angular.module('accountRepository', [])
.factory('AccountRepository', [
'AccountDAO',
'EarningDAO',
'ExpenseDAO',
'SQLiteService',
'$q',
function(AccountDAO, EarningDAO, ExpenseDAO, SQLiteService, $q) {
	
	var findAll = function(queries) {
		return $q(function(resolve, reject) {
			SQLiteService.execute(db, queries).then(function(result) {
				var accounts = [];
				
				for(var i=0; i < result.rows.length; i++) {
					var account = setAccount(result.rows.item(i));
					accounts[i] = account;
				}

				resolve(accounts);
			}, function(err) {
				reject(err);
			});
	  });
	};

	var setAccount = function(item) {
		var account = {
			id: item.id,
			name: item.name,
			value: item.value,
			icon: item.icon,
			iconColorR: item.iconColorR,
			iconColorG: item.iconColorG,
			iconColorB: item.iconColorB,
			iconColor: {
				color: 'rgb(' + item.iconColorR + ',' + item.iconColorG + ',' + item.iconColorB + ')'
			}
		};

		return account;
	};

	return {
		add: function(account) {
			var queries = [AccountDAO.add(account)];
			return SQLiteService.execute(db, queries);
		},
		edit: function(account) {
			var queries = [AccountDAO.edit(account)];
			return SQLiteService.execute(db, queries);
		},
		remove: function(accountId) {
			var queries = [AccountDAO.remove(accountId)];
			return SQLiteService.execute(db, queries);
		},
		findAll: function() {
			var queries = [AccountDAO.findAll()];
			return findAll(queries);
		},
		findAllFromView: function() {
			var queries = [AccountDAO.findAllFromView()];
			return findAll(queries);
		},
		findById: function(accountId) {
			var queries = [AccountDAO.findById(accountId)];
			return $q(function(resolve, reject) {
				SQLiteService.execute(db, queries).then(function(result) {
					var account = setAccount(result.rows.item(0));
					resolve(account);
				}, function(err) {
					reject(err);
				});
		  });
		},
		addTransfer: function(transfer) {
			var earning = {
				description: transfer.description,
				value: transfer.value,
				effectiveDate: transfer.effectiveDate,
				received: true,
				account: transfer.to,
				category: {
					id: 1
				}
			};
			var expense = {
				description: transfer.description,
				value: transfer.value,
				effectiveDate: transfer.effectiveDate,
				paid: true,
				account: transfer.from,
				category: {
					id: 2
				}
			};

			var queries = [EarningDAO.add(earning), ExpenseDAO.add(expense)];
			return SQLiteService.execute(db, queries);
		}
	}
}]);