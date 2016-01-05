angular.module('expenseRepository', [])
.factory('ExpenseRepository', [
'ExpenseDAO',
'SQLiteService',
'$q',
function(ExpenseDAO, SQLiteService, $q) {

	var findAll = function(queries) {
		return $q(function(resolve, reject) {
			SQLiteService.execute(db, queries).then(function(result) {
				var expenses = [];
				
				for(var i=0; i < result.rows.length; i++) {
					var expense = setExpense(result.rows.item(i));
					expenses[i] = expense;
				}

				resolve(expenses);
			}, function(err) {
				reject(err);
			});
	  });
	}

	var setExpense = function(item) {
		var expense = {
			id: item.id,
			description: item.description,
			value: item.value,
			effectiveDate: new Date(item.effectiveDate),
			paid: item.paid == 1,
			account: {
				id: item.accountId,
				name: item.accountName,
				value: item.accountValue,
				icon: item.accountIcon,
				iconColor: {
					color: 'rgb(' + item.accountIconColorR + ',' + item.accountIconColorG + ',' + item.accountIconColorB + ')'
				}
			},
			category: {
				id: item.categoryId,
				name: item.categoryName,
				icon: item.categoryIcon,
				iconColor: {
					color: 'rgb(' + item.categoryIconColorR + ',' + item.categoryIconColorG + ',' + item.categoryIconColorB + ')'
				}
			}
		}

		return expense;
	}

	return {
		add: function(expense) {
			var queries = [ExpenseDAO.add(expense)];
            return SQLiteService.execute(db, queries);
		},
		edit: function(expense, option) {
			var queries = [ExpenseDAO.edit(expense)];
            return SQLiteService.execute(db, queries);
		},
		remove: function(expense, option) {
			var queries = [ExpenseDAO.remove(expense)];
            return SQLiteService.execute(db, queries);
		},
		findAll: function() {
			var queries = [ExpenseDAO.findAll()];
			return findAll(queries);
		},
		filter: function(filters) {
			var queries = [ExpenseDAO.filter(filters)];
			return findAll(queries);
		},
		findById: function(expenseId) {
			var queries = [ExpenseDAO.findById(expenseId)];
			return $q(function(resolve, reject) {
				SQLiteService.execute(db, queries).then(function(result) {
					var expense = setExpense(result.rows.item(0));
					resolve(expense);
				}, function(err) {
					reject(err);
				});
		  });
		}
	}
}]);