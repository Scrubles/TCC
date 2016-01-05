angular.module('expenseDAO', [])
.factory('ExpenseDAO', [
'$cordovaSQLite',
'$filter',
function($cordovaSQLite, $filter) {
	var queryAdd = 'INSERT INTO expenses (description, value, effectiveDate, paid, accountId, categoryId) VALUES (?,?,?,?,?,?)';
	var queryEdit = 'UPDATE expenses SET description=?, value=?, effectiveDate=?, paid=?, accountId=?, categoryId=? WHERE id=?';
	var queryRemove = 'DELETE FROM expenses WHERE id=?';

	var accountFields = ' a.id AS accountId, a.name AS accountName, a.value AS accountValue, a.icon AS accountIcon, a.iconColorR AS accountIconColorR, a.iconColorG AS accountIconColorG, a.iconColorB AS accountIconColorB ';
	var categoryFields = ' c.id AS categoryId, c.name AS categoryName, c.icon AS categoryIcon, c.iconColorR AS categoryIconColorR, c.iconColorG AS categoryIconColorG, c.iconColorB AS categoryIconColorB ';
	var querySelect = 'SELECT e.id AS id, e.description AS description, e.value AS value, e.effectiveDate AS effectiveDate, e.paid AS paid, ' + accountFields + ', ' + categoryFields + ' FROM expenses AS e';
	var queryJoinAccount = ' JOIN vw_accounts AS a ON e.accountId = a.id';
	var queryJoinCategory = ' JOIN categories AS c ON e.categoryId = c.id';
	var queryWhereMonth = " WHERE strftime('%m-%Y', datetime(effectiveDate/1000, 'unixepoch')) = ?";
	var queryWhereId = ' WHERE e.id=? ';
	var queryOrderByDate = ' ORDER BY e.effectiveDate DESC';

	return {
		add: function(expense) {
			return {
				query: queryAdd,
				binding: [expense.description, expense.value, expense.effectiveDate.getTime(), expense.paid ? 1 : 0, expense.account.id, expense.category.id]
			};
		},
		edit: function(expense) {
			return {
				query: queryEdit,
				binding: [expense.description, expense.value, expense.effectiveDate.getTime(), expense.paid ? 1 : 0, expense.account.id, expense.category.id, expense.id]
			};
		},
		remove: function(expense) {
			return {
				query: queryRemove, 
				binding: [expense.id]
			};
		},
		findAll: function() {
			return { 
				query: querySelect + queryJoinAccount + queryJoinCategory + queryOrderByDate, 
				binding: []
			};
		},
		filter: function(filters) {
			var query = querySelect + queryJoinAccount + queryJoinCategory + queryWhereMonth;
			var binding = [$filter('date')(filters.currentMonth, 'MM-yyyy')];

			if(filters.accounts.length > 0) {
				var accountIds = $filter('join')(filters.accounts, 'id');
			  query += ' AND a.id IN (' + accountIds + ')';
			}
			if(filters.categories.length > 0) {
				var categoryIds = $filter('join')(filters.categories, 'id');
			  query += ' AND c.id IN (' + categoryIds + ')';
			}
			if(filters.paid) {
				query += ' AND e.paid = 1';
			}

			return {
				query: query + queryOrderByDate, 
				binding: binding
			};
		},
		findById: function(expenseId) {
			return {
				query: querySelect + queryJoinAccount + queryJoinCategory + queryWhereId, 
				binding: [expenseId]
			};
		}
	}
}]);