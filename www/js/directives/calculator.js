"use strict";
angular.module('ionic-calculator', [])
.directive('ionicCalculator', [
'$ionicModal', 
'$cordovaToast',
'$translate', 
function ($ionicModal, $cordovaToast, $translate) {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      ngValue: '=ngValue',
      isPositive: '=positive',
      account: '=account',
      messages: '=messages'
    },
    link: function (scope, element, attrs) {
      var translations = {}, lastIndex, isDecimal, operators = ['+', '-', '\u00D7', '\u00F7'];
      $translate(['POSITIVE_VALUE']).then(function(translatedTexts) {
        translations.positiveValue = translatedTexts.POSITIVE_VALUE;
      });

      scope.eraseLast = function() {
        if(isEmpty()) {
          return false;
        }

        scope.equation = scope.equation = scope.equation.toString().slice(0, -1);

        switch(lastIndex) {
          case '.':
            isDecimal = false;
            break;
          case '+':
          case '-':
          case '\u00D7':
          case '\u00F7':
            var equation = scope.equation;

            for(var i=0; i < operators.length; i++) {
              var operator = operators[i];
              var split = equation.split(operator);
              equation = split[split.length - 1];
            }

            isDecimal = equation.indexOf('.') != -1;
            break;
        }

        lastIndex = scope.equation[scope.equation.length - 1];
      }

      scope.eraseAll = function() {
        scope.result = undefined;
        scope.equation = '';
        lastIndex = '';
        isDecimal = false;
      }

      scope.addNumber = function(n) {
        scope.equation += n;
        lastIndex = n;
      }

      scope.addDecimal = function() {
        if(isDecimal)
          return false;

        scope.equation += '.';
        lastIndex = '.';
        isDecimal = true;
      }

      scope.addOperator = function(operator) {
        if(lastIndexIsOperator() || lastIndex == '.')
          return false;

        if(operator != '-' && isEmpty())
          return false;

        if(!isEmpty())
          scope.result = evals();

        scope.equation += operator;
        lastIndex = operator;
        isDecimal = false;
      }

      scope.equals = function() {
        if(isEmpty())
          return false;

        try {
          scope.equation = evals();
          scope.result = angular.copy(scope.equation);
          lastIndex = scope.equation[scope.equation.length - 1];
          isDecimal = false;
        } catch(e) {}
      }

      var evals = function() {
        return eval(scope.equation.toString().replace(/\u00D7/g, '*').replace(/\u00F7/g, '/'));
      }

      var isEmpty = function() {
        return scope.equation.length == 0;
      }

      var lastIndexIsOperator = function() {
        return operators.indexOf(lastIndex) != -1;
      }

      $ionicModal.fromTemplateUrl('templates/directives/calculator.html', {
        scope: scope
      }).then(function(modal) {
        scope.modal = modal;
      });

      scope.$on('$destroy', function() {
        scope.modal.remove();
      });

      scope.cancel = function() {
        scope.modal.hide();
      }

      scope.ok = function() {
        scope.equals();

        if(scope.isPositive && scope.result <= 0) {
          $cordovaToast.show(translations.positiveValue, 'short', 'bottom');
        } else {
          scope.ngValue = angular.copy(scope.result);
          scope.modal.hide();
        }
      }

      element.on("click", function () {
        scope.eraseAll();
        scope.modal.show();
      });
    }
  }
}]);