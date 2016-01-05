angular.module('earningRepository', [])
.factory('EarningRepository', [
'EarningDAO',
'SQLiteService',
'$q',
function(EarningDAO, SQLiteService, $q) {

	var findAll = function(queries) {
		return $q(function(resolve, reject) {
			SQLiteService.execute(db, queries).then(function(result) {
				var earnings = [];
				
				for(var i=0; i < result.rows.length; i++) {
					var earning = setEarning(result.rows.item(i));
					earnings[i] = earning;
				}

				resolve(earnings);
			}, function(err) {
				reject(err);
			});
	  });
	}

	var setEarning = function(item) {
		var earning = {
			id: item.id,
			description: item.description,
			value: item.value,
			effectiveDate: new Date(item.effectiveDate),
			received: item.received == 1,
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

		return earning;
	}

	return {
		add: function(earning) {
			var queries = [EarningDAO.add(earning)];
            return SQLiteService.execute(db, queries);
		},
		edit: function(earning, option) {
			var queries = [EarningDAO.edit(earning)];
            return SQLiteService.execute(db, queries);
		},
		remove: function(earning, option) {
			var queries = [EarningDAO.remove(earning)];
            return SQLiteService.execute(db, queries);
		},
		findAll: function() {
			var queries = [EarningDAO.findAll()];
			return findAll(queries);
		},
		filter: function(filters) {
			var queries = [EarningDAO.filter(filters)];
			return findAll(queries);
		},
		findById: function(earningId) {
			var queries = [EarningDAO.findById(earningId)];
			return $q(function(resolve, reject) {
				SQLiteService.execute(db, queries).then(function(result) {
					var earning = setEarning(result.rows.item(0));
					resolve(earning);
				}, function(err) {
					reject(err);
				});
		  });
		}
	}
}]);