ionic.Platform.ready(function() {
  angular.bootstrap(document, ['app']);
});

var db = null;

angular.module('app', 
  [
    'ionic', 'ngCordova', 'pascalprecht.translate',
    'checklist-model',
    'ionic-datepicker', 'ionic-calculator', 'ionic-iconpicker',
    'sqliteService', 'selectPositionService', 'utilsService',
    'joinFilter', 'sumFilter', 'whereFilter',
    'settingsController',
    'accountController', 'accountRepository', 'accountDAO',
    'earningController', 'earningRepository', 'earningDAO',
    'expenseController', 'expenseRepository', 'expenseDAO',
    'categoryController', 'categoryRepository', 'categoryDAO'
  ]
)
.run([
'$ionicPlatform', 
'$cordovaSQLite', 
'$rootScope',
'$window',
'$ionicHistory', 
'$state',
'$locale',
function(
$ionicPlatform,
$cordovaSQLite,
$rootScope,
$window,
$ionicHistory,
$state,
$locale
) {
  
  /* BACKBUTTON */
  $ionicPlatform.registerBackButtonAction(function() {
    if($ionicHistory.backView())
      $ionicHistory.goBack();
    else if(!$state.is('app.accounts')) {
      $ionicHistory.nextViewOptions({
        historyRoot: true,
        expire: 300
      });
      $state.go('app.accounts');
    } else
      ionic.Platform.exitApp();
  }, 125);

  /* DATABASE */
  db = $cordovaSQLite.openDB('wmoney.db');
  db.executeSql('PRAGMA foreign_keys=ON;');

  $ionicPlatform.ready(function() {
    /* IONIC */
    if($window.cordova && $window.cordova.plugins && $window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if($window.StatusBar) {
      StatusBar.styleLightContent();
    }
  
    /* GLOBAL */
    $rootScope.selectedCurrency = $locale.NUMBER_FORMATS.CURRENCY_SYM;

    $rootScope.historyBack = function() {
      $ionicHistory.goBack();
    };
  });
}])

.config(['$translateProvider', function($translateProvider) {
  $translateProvider.useSanitizeValueStrategy(null);
  $translateProvider.useStaticFilesLoader({
    prefix: 'js/languages/',
    suffix: '.json'
  });

  var locale = window.localStorage.getItem('locale');

  $translateProvider.preferredLanguage(locale ? locale : 'en-us').fallbackLanguage('en-us');
}])

.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
  $stateProvider
  .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    resolve: ['SQLiteService', function(SQLiteService) {
      return SQLiteService.migrate(db);
    }]
  })

  .state('app.accounts', {
    url: '/accounts',
    views: {
      'content': {
        templateUrl: 'templates/accounts/list.html',
        controller: 'AccountController as accountCtrl'
      }
    },
    onEnter: ['$rootScope', function($rootScope) {
      $rootScope.globalNavClass = 'has-subheader';
    }],
    onExit: ['$rootScope', function($rootScope) {
      $rootScope.globalNavClass = '';
    }]
  })
  .state('app.accounts-new', {
    url: '/accounts/new',
    views: {
      'content': {
        templateUrl: 'templates/accounts/form.html',
        controller: 'AccountFormController as accountCtrl'
      }
    }
  })
  .state('app.accounts-edit', {
    url: '/accounts/:accountId',
    views: {
      'content': {
        templateUrl: 'templates/accounts/form.html',
        controller: 'AccountFormController as accountCtrl'
      }
    }
  })
  .state('app.transfer', {
    url: '/transfer',
    views: {
      'content': {
        templateUrl: 'templates/accounts/transfer.html',
        controller: 'AccountTransferController as transferCtrl'
      }
    }
  })

  .state('app.earnings', {
    url: '/earnings',
    views: {
      'content': {
        templateUrl: 'templates/earnings/list.html',
        controller: 'EarningController as earningCtrl'
      }
    },
    onEnter: ['$rootScope', function($rootScope) {
      $rootScope.globalNavClass = 'has-subheader';
      $rootScope.showPendingsEarnings = true;
    }],
    onExit: ['$rootScope', function($rootScope) {
      $rootScope.globalNavClass = '';
      $rootScope.showPendingsEarnings = false;
    }]
  })
  .state('app.earnings-new', {
    url: '/earnings/new?accountId',
    views: {
      'content': {
        templateUrl: 'templates/earnings/form.html',
        controller: 'EarningFormController as earningCtrl'
      }
    }
  })
  .state('app.earnings-edit', {
    url: '/earnings/:earningId',
    views: {
      'content': {
        templateUrl: 'templates/earnings/form.html',
        controller: 'EarningFormController as earningCtrl'
      }
    }
  })

  .state('app.expenses', {
    url: '/expenses',
    views: {
      'content': {
        templateUrl: 'templates/expenses/list.html',
        controller: 'ExpenseController as expenseCtrl'
      }
    },
    onEnter: ['$rootScope', function($rootScope) {
      $rootScope.globalNavClass = 'has-subheader';
      $rootScope.showPendingsExpenses = true;
    }],
    onExit: ['$rootScope', function($rootScope) {
      $rootScope.globalNavClass = '';
      $rootScope.showPendingsExpenses = false;
    }]
  })
  .state('app.expenses-new', {
    url: '/expenses/new?accountId',
    views: {
      'content': {
        templateUrl: 'templates/expenses/form.html',
        controller: 'ExpenseFormController as expenseCtrl'
      }
    }
  })
  .state('app.expenses-edit', {
    url: '/expenses/:expenseId',
    views: {
      'content': {
        templateUrl: 'templates/expenses/form.html',
        controller: 'ExpenseFormController as expenseCtrl'
      }
    }
  })
  
  .state('app.categories', {
    url: '/categories',
    views: {
      'content': {
        templateUrl: 'templates/categories/list.html',
        controller: 'CategoryController as categoryCtrl'
      }
    }
  })
  .state('app.categories-new', {
    url: '/categories/new?transactionType',
    views: {
      'content': {
        templateUrl: 'templates/categories/form.html',
        controller: 'CategoryFormController as categoryCtrl'
      }
    }
  })
  .state('app.categories-edit', {
    url: '/categories/:categoryId',
    views: {
      'content': {
        templateUrl: 'templates/categories/form.html',
        controller: 'CategoryFormController as categoryCtrl'
      }
    }
  })

  .state('app.settings', {
    url: '/settings',
    views: {
      'content': {
        templateUrl: 'templates/settings/settings.html',
        controller: 'SettingsController as settingsCtrl'
      }
    }
  });

  $urlRouterProvider.otherwise(function($injector) {
    var $state = $injector.get('$state');
    $state.go('app.accounts');
  });
}]);
