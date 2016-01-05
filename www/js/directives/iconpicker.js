"use strict";
angular.module('ionic-iconpicker', [])
.directive('ionicIconpicker', [
'$ionicModal', 
function ($ionicModal) {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      ngIcon: '=ngIcon',
      ngIconR: '=ngIconR',
      ngIconG: '=ngIconG',
      ngIconB: '=ngIconB'
    },
    link: function (scope, element, attrs) {
      scope.icons = [
        'icon-bank', 'icon-safe', 'icon-wallet', 'ion-card', 'icon-diamond', 'icon-moneybag', 'icon-pig', 'icon-dollars', 'icon-dollar', 'icon-coins',
        'mdi mdi-trending-up', 'icon-stats-up', 'mdi mdi-trending-down', 'icon-stats-down',
        'mdi mdi-gift', 'icon-medal-b',
        'icon-suitcase-a',
        'mdi mdi-heart',
        'mdi mdi-monitor', 'mdi mdi-desktop-tower', 'mdi mdi-laptop', 'mdi mdi-cellphone-android', 
        'ion-steam', 'icon-gamepad',
        'mdi mdi-headphones',
        'icon-book',
        'mdi mdi-silverware-variant',
        'icon-beer', 'icon-film', 'ion-ios-americanfootball', 'ion-ios-baseball', 'ion-ios-basketball', 'ion-ios-football',
        'mdi mdi-dice-1', 'mdi mdi-dice-6',
        'icon-basket', 'mdi mdi-cart', 'ion-tshirt',
        'ion-ios-paw',
        'mdi mdi-hotel', 'mdi mdi-home-variant', 'mdi mdi-flash', 'mdi mdi-water', 'mdi mdi-phone', 'icon-refrigerator',
        'mdi mdi-pill', 'icon-injection',
        'mdi mdi-school',
        'icon-plane', 'mdi mdi-car', 'mdi mdi-gas-station', 'icon-bus', 'mdi mdi-train', 'mdi mdi-ferry',
        'icon-tags',
        'icon-wmoney'
      ];

      $ionicModal.fromTemplateUrl('templates/directives/iconpicker.html', {
        scope: scope
      }).then(function(modal) {
        scope.modal = modal;
      });

      scope.$on('$destroy', function() {
        scope.modal.remove();
      });

      scope.selectIcon = function(icon) {
        scope.icon = icon;
      }

      scope.cancel = function() {
        scope.modal.hide();
      }

      scope.ok = function() {
        scope.ngIcon = angular.copy(scope.icon);
        scope.ngIconR = angular.copy(scope.color.R);
        scope.ngIconG = angular.copy(scope.color.G);
        scope.ngIconB = angular.copy(scope.color.B);

        scope.modal.hide();
      }

      element.on("click", function () {
        scope.icon = angular.copy(scope.ngIcon);
        scope.color = {
          R: angular.copy(scope.ngIconR),
          G: angular.copy(scope.ngIconG),
          B: angular.copy(scope.ngIconB)
        }

        scope.modal.show();
      });
    }
  }
}]);