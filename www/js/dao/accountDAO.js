angular.module('accountDAO', [])
.factory('AccountDAO', [
function() {
	var queryAdd = 'INSERT INTO accounts (name, value, icon, iconColorR, iconColorG, iconColorB) VALUES (?,?,?,?,?,?)';
	var queryEdit = 'UPDATE accounts SET name=?, value=?, icon=?, iconColorR=?, iconColorG=?, iconColorB=? WHERE id=?';
	var queryRemove = 'DELETE FROM accounts WHERE id=?';

	var querySelect = 'SELECT id, name, value, icon, iconColorR, iconColorG, iconColorB';
	var queryFindAll = querySelect + ' FROM accounts';
	var queryFindAllFromView = querySelect + ' FROM vw_accounts';
	var queryFindById = queryFindAll + ' WHERE id=?';

	return {
		add: function(account) {
			return {
				query: queryAdd,
				binding: [account.name, account.value, account.icon, account.iconColorR, account.iconColorG, account.iconColorB]
			};
		},
		edit: function(account) {
			return {
				query: queryEdit,
				binding: [account.name, account.value, account.icon, account.iconColorR, account.iconColorG, account.iconColorB, account.id]
			};
		},
		remove: function(accountId) {
			return {
				query: queryRemove, 
				binding: [accountId]
			};
		},
		findAll: function() {
			return {
				query: queryFindAll, 
				binding: []
			};
		},
		findAllFromView: function() {
			return {
				query: queryFindAllFromView, 
				binding: []
			};
		},
		findById: function(accountId) {
			return {
				query: queryFindById, 
				binding: [accountId]
			};
		}
	};
}]);