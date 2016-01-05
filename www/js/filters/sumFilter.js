angular.module('sumFilter', [])
.filter('sum', 
function() {
  return function(list, property) {
    var sum = 0;

    angular.forEach(list, function(obj) {
    	sum += obj[property];
    });

    return sum;
  };
});