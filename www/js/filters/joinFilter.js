angular.module('joinFilter', [])
.filter('join', [
'$translate',
function($translate) {

  return function(list, property, maxLength, all, none) {

    if(!list)
      return false;

  	if(all && list.length == maxLength)
  		return all;

    if(none && list.length == 0)
      return none

  	var properties = [];
    angular.forEach(list, function(obj) {
    	properties.push(obj[property]);
    });

    return properties.join(', ');
  };
}]);