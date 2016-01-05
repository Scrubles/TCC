angular.module('whereFilter', [])
.filter('whereIn', [
function() {
  return function(list, columnName, arrayFilters) {
    var filteredList = [];

    angular.forEach(list, function(obj) {
    	if(arrayFilters.indexOf(obj[columnName]) != -1)
    	  filteredList.push(obj);
    });

    return filteredList;
  };
}])
.filter('whereDate', ['$filter',
function($filter) {
  return function(list, columnName, formattedDate) {
    var filteredList = [];

    angular.forEach(list, function(obj) {
      var objDate = obj[columnName];
      var objFormattedDate = $filter('date')(objDate, 'yyyy-MM-dd');
    	if(formattedDate == objFormattedDate)
    	  filteredList.push(obj);
    });

    return filteredList;
  };
}]);