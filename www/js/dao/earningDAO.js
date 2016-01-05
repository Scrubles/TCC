angular.module('earningDAO', [])
.factory('EarningDAO', [
'$cordovaSQLite',
'$filter',
function($cordovaSQLite, $filter) {
	var queryAdd = 'INSERT INTO earnings (description, value, effectiveDate, received, accountId, categoryId) VALUES (?,?,?,?,?,?)';
	var queryEdit = 'UPDATE earnings SET description=?, value=?, effectiveDate=?, received=?, accountId=?, categoryId=? WHERE id=?';
	var queryRemove = 'DELETE FROM earnings WHERE id=?';

	var accountFields = ' a.id AS accountId, a.name AS accountName, a.value AS accountValue, a.icon AS accountIcon, a.iconColorR AS accountIconColorR, a.iconColorG AS accountIconColorG, a.iconColorB AS accountIconColorB ';
	var categoryFields = ' c.id AS categoryId, c.name AS categoryName, c.icon AS categoryIcon, c.iconColorR AS categoryIconColorR, c.iconColorG AS categoryIconColorG, c.iconColorB AS categoryIconColorB ';
	var querySelect = 'SELECT e.id AS id, e.description AS description, e.value AS value, e.effectiveDate AS effectiveDate, e.received AS received, ' + accountFields + ', ' + categoryFields + ' FROM earnings AS e';
	var queryJoinAccount = ' JOIN vw_accounts AS a ON e.accountId = a.id';
	var queryJoinCategory = ' JOIN categories AS c ON e.categoryId = c.id';
	var queryWhereMonth = " WHERE strftime('%m-%Y', datetime(effectiveDate/1000, 'unixepoch')) = ?";
	var queryWhereId = ' WHERE e.id=? ';
	var queryOrderByDate = ' ORDER BY e.effectiveDate DESC';

	return {
		add: function(earning) {
			return {
				query: queryAdd,
				binding: [earning.description, earning.value, earning.effectiveDate.getTime(), earning.received ? 1 : 0, earning.account.id, earning.category.id]
			};
		},
		edit: function(earning) {
			return {
				query: queryEdit,
				binding: [earning.description, earning.value, earning.effectiveDate.getTime(), earning.received ? 1 : 0, earning.account.id, earning.category.id, earning.id]
			};
		},
		remove: function(earning) {
			return {
				query: queryRemove, 
				binding: [earning.id]
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
			if(filters.received) {
				query += ' AND e.received = 1';
			}

			return {
				query: query + queryOrderByDate, 
				binding: binding
			};
		},
		findById: function(earningId) {
			return {
				query: querySelect + queryJoinAccount + queryJoinCategory + queryWhereId, 
				binding: [earningId]
			};
		}
	}
}]);