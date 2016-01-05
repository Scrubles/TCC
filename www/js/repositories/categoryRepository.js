angular.module('categoryRepository', [])
.factory('CategoryRepository', [
'CategoryDAO',
'SQLiteService',
'$q',
'$translate',
function(CategoryDAO, SQLiteService, $q, $translate) {
	
	var findAll = function(queries) {
		return $q(function(resolve, reject) {
			SQLiteService.execute(db, queries).then(function(result) {
				var categories = [];
				
				for(var i=0; i < result.rows.length; i++) {
					var category = setCategory(result.rows.item(i));
					categories[i] = category;
				}

				resolve(categories);
			}, function(err) {
				reject(err);
			});
	  });
	};

	var setCategory = function(item) {
		var category = {
			id: item.id,
			name: item.name,
			icon: item.icon,
			iconColorR: item.iconColorR,
			iconColorG: item.iconColorG,
			iconColorB: item.iconColorB,
			iconColor: {
				color: 'rgb(' + item.iconColorR + ',' + item.iconColorG + ',' + item.iconColorB + ')'
			},
			transactionType: item.transactionType,
			isDeletable: item.isDeletable
		};

		return category;
	};

	return {
		add: function(category) {
			var queries = [CategoryDAO.add(category)];
			return SQLiteService.execute(db, queries);
		},
		edit: function(category) {
			var queries = [CategoryDAO.edit(category)];
			return SQLiteService.execute(db, queries);
		},
		changeNames: function(language) {
			var translations = $translate.instant(['TRANSFER']), queries = [];
			queries.push(CategoryDAO.changeName(translations.TRANSFER, 1));
			queries.push(CategoryDAO.changeName(translations.TRANSFER, 2));

			return SQLiteService.execute(db, queries)
		},
		remove: function(categoryId) {
			var queries = [CategoryDAO.remove(categoryId)];
			return SQLiteService.execute(db, queries);
		},
		findAll: function() {
			var queries = [CategoryDAO.findAll()];
			return findAll(queries);
		},
		findByTransaction: function(transactionType) {
			var queries = [CategoryDAO.findByTransaction(transactionType)];
			return findAll(queries);
		},
		findById: function(categoryId) {
			var queries = [CategoryDAO.findById(categoryId)];
			return $q(function(resolve, reject) {
				SQLiteService.execute(db, queries).then(function(result) {
					var category = setCategory(result.rows.item(0));
					resolve(category);
				}, function(err) {
					reject(err);
				});
		  });
		}
	}
}]);