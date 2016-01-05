angular.module('utilsService', [])
.factory('Utils', [
'$window', 
function ($window) {

  var random = function(n) {
     Math.floor((Math.random()*n) + 1);
  }

  return {
    random: random,
    getNewId: function() {
    	return new Date().getTime();
    },
    cryptography: function(text) {
      return md5(text);
    }
  };
}]);