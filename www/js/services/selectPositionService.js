angular.module('selectPositionService', [])
.factory('SelectPositionService', [
function () {
  var headerHeight = 43;
  var verticalSpace = 10;
  var horizontalSpace = 3;
  var itemHeight = 42;

  return {
    calculatePosition: function(id, qtItems) {
      var itemsHeight = qtItems*itemHeight, style, windowHeight = window.innerHeight;;

      var elem = document.getElementById(id);
      var clientRect = elem.getBoundingClientRect();

      var topHeight = clientRect.top - headerHeight;
      var bottomHeight = windowHeight - clientRect.bottom;

      if(bottomHeight > itemsHeight) {
        style = {
          'top': clientRect.bottom + 'px',
          'min-height': itemsHeight + 'px'
        }
      } else if(bottomHeight > topHeight) {
        style = {
          'top': clientRect.bottom + 'px',
          'min-height': (bottomHeight - verticalSpace) + 'px'
        }
      } else if(topHeight > itemsHeight) {
        style = {
          'top': (topHeight + headerHeight - itemsHeight) + 'px',
          'bottom': (topHeight + verticalSpace) + 'px',
          'min-height': itemsHeight + 'px'
        }
      } else {
        style = {
          'top': (headerHeight + verticalSpace) + 'px',
          'min-height': (topHeight - verticalSpace) + 'px'
        }
      }
      
      style.width = clientRect.width - 2*horizontalSpace + 'px';
      style.left = clientRect.left + horizontalSpace + 'px';

      return style;
    }
  }
}]);