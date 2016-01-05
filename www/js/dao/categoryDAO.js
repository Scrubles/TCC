angular.module('categoryDAO', [])
.factory('CategoryDAO', [
function() {
	var queryAdd = 'INSERT INTO categories (name, icon, iconColorR, iconColorG, iconColorB, transactionType, isDeletable) VALUES (?,?,?,?,?,?,?)';
	var queryEdit = 'UPDATE categories SET name=?, icon=?, iconColorR=?, iconColorG=?, iconColorB=?, transactionType=? WHERE id=?';
	var queryChangeName = 'UPDATE categories SET name=? WHERE id=?';
	var queryRemove = 'DELETE FROM categories WHERE id=?';

	var querySelect = 'SELECT id, name, icon, iconColorR, iconColorG, iconColorB, transactionType, isDeletable FROM categories';
	var queryFindByTransaction = querySelect + ' WHERE transactionType=?';
	var queryFindById = querySelect + ' WHERE id=?';

	return {
		add: function(category) {
			return {
				query: queryAdd,
				binding: [category.name, category.icon, category.iconColorR, category.iconColorG, category.iconColorB, category.transactionType, category.isDeletable]
			};
		},
		edit: function(category) {
			return {
				query: queryEdit,
				binding: [category.name, category.icon, category.iconColorR, category.iconColorG, category.iconColorB, category.transactionType, category.id]
			};
		},
		changeName: function(name, id) {
			return {
				query: queryChangeName,
				binding: [name, id]
			};
		},
		remove: function(categoryId) {
			return {
				query: queryRemove, 
				binding: [categoryId]
			};
		},
		findAll: function() {
			return {
				query: querySelect, 
				binding: []
			};
		},
		findByTransaction: function(transactionType) {
			return {
				query: queryFindByTransaction, 
				binding: [transactionType]
			};
		},
		findById: function(categoryId) {
			return {
				query: queryFindById, 
				binding: [categoryId]
			};
		}
	};
}]);