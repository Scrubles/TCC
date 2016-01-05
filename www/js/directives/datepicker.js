"use strict";
angular.module('ionic-datepicker', [])
.directive('ionicDatepicker', [
'$rootScope',
'$ionicModal', 
'$locale', 
function ($rootScope, $ionicModal, $locale) {
  return {
    restrict: 'AE',
    replace: true,
    scope: {
      ipDate: '=idate',
      notifyTime: '=notifyTime'
    },
    link: function (scope, element, attrs) {
      scope.selectedCurrency = $rootScope.selectedCurrency;

      var datetimeFormats = $locale.DATETIME_FORMATS;

      var monthsList = datetimeFormats.MONTH;

      var currentDate = angular.copy(scope.ipDate);
      scope.weekNames = datetimeFormats.SHORTDAY;

      scope.today = {};
      scope.today.dateObj = new Date();
      scope.today.date = scope.today.dateObj.getDate();
      scope.today.month = scope.today.dateObj.getMonth();
      scope.today.year = scope.today.dateObj.getFullYear();

      var refreshDateList = function (current_date) {
        currentDate = angular.copy(current_date);

        var firstDay = new Date(current_date.getFullYear(), current_date.getMonth(), 1).getDate();
        var lastDay = new Date(current_date.getFullYear(), current_date.getMonth() + 1, 0).getDate();

        scope.dayList = [];

        for (var i = firstDay; i <= lastDay; i++) {
          var tempDate = new Date(current_date.getFullYear(), current_date.getMonth(), i);
          scope.dayList.push({
            date: tempDate.getDate(),
            month: tempDate.getMonth(),
            year: tempDate.getFullYear(),
            day: tempDate.getDay(),
            dateString: tempDate.toString(),
            epochLocal: tempDate.getTime(),
            epochUTC: (tempDate.getTime() + (tempDate.getTimezoneOffset() * 60 * 1000))
          });
        }

        var firstDay = scope.dayList[0].day;

        for (var j = 0; j < firstDay; j++) {
          scope.dayList.unshift({});
        }

        scope.rows = [];
        scope.cols = [];

        scope.currentMonth = monthsList[current_date.getMonth()];
        scope.currentYear = current_date.getFullYear();

        scope.numColumns = 7;
        scope.rows.length = 6;
        scope.cols.length = scope.numColumns;

      };

      scope.prevMonth = function () {
        if (currentDate.getMonth() === 1) {
          currentDate.setFullYear(currentDate.getFullYear());
        }
        currentDate.setMonth(currentDate.getMonth() - 1);

        scope.currentMonth = monthsList[currentDate.getMonth()];
        scope.currentYear = currentDate.getFullYear();

        refreshDateList(currentDate)
      };

      scope.nextMonth = function () {
        if (currentDate.getMonth() === 11) {
          currentDate.setFullYear(currentDate.getFullYear());
        }
        currentDate.setMonth(currentDate.getMonth() + 1);

        scope.currentMonth = monthsList[currentDate.getMonth()];
        scope.currentYear = currentDate.getFullYear();

        refreshDateList(currentDate)
      };

      scope.dateSelection = {selected: false, selectedDate: '', submitted: false};

      scope.dateSelected = function (date) {
        scope.selectedDateString = date.dateString;
        scope.dateSelection.selected = true;
        scope.dateSelection.selectedDate = new Date(date.dateString);
      };

      var selectDate = function(date) {
        var tempDay = {
          date: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear()
        }

        for(var i=0; i < scope.dayList.length; i++) {
          var day = scope.dayList[i];

          if(day.date == tempDay.date && day.month == tempDay.month && day.year == tempDay.year) {
            scope.dateSelected(day);
          }
        }
      };

      $ionicModal.fromTemplateUrl('templates/directives/datepicker.html', {
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

      scope.selectToday = function() {
        refreshDateList(scope.today.dateObj);
        selectDate(scope.today.dateObj);
      }

      scope.ok = function() {
        scope.ipDate = angular.copy(scope.dateSelection.selectedDate);

        if(scope.notifyTime) {
          scope.notifyTime.setFullYear(scope.ipDate.getFullYear());
          scope.notifyTime.setMonth(scope.ipDate.getMonth());
          scope.notifyTime.setDate(scope.ipDate.getDate());
        }

        scope.modal.hide()
      }

      element.on("click", function () {
        if (!scope.ipDate) {
          refreshDateList(scope.today.dateObj);
          selectDate(scope.today.dateObj);
        } else {
          refreshDateList(angular.copy(scope.ipDate));
          selectDate(scope.ipDate);
        }

        scope.modal.show();
      });
    }
  }
}]);