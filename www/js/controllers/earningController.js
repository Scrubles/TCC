var cachedEarning = null;

angular.module('earningController', [])

.controller('EarningController', [
'EarningRepository',
'AccountRepository',
'CategoryRepository',
'SelectPositionService',
'$scope',
'$translate',
'$state',
'$ionicModal',
'$ionicScrollDelegate',
'$ionicSideMenuDelegate',
function(
    EarningRepository, 
    AccountRepository, 
    CategoryRepository, 
    SelectPositionService, 
    $scope, 
    $translate, 
    $state, 
    $ionicModal, 
    $ionicScrollDelegate, 
    $ionicSideMenuDelegate
) {
	
	var self = this, today = new Date(), toSave = false;;
    self.filters = {currentMonth: new Date(today.getFullYear(), today.getMonth(), 1), accounts: [], categories: []};
    self.modalFilters = {accounts: [], categories: []};

	$translate(['ALL_ACCOUNTS', 'FILTER_ACCOUNTS', 'ALL_CATEGORIES', 'FILTER_CATEGORIES']).then(function(translatedTexts) {
        self.allAccounts = translatedTexts.ALL_ACCOUNTS;
        self.filterAccounts = translatedTexts.FILTER_ACCOUNTS;
        self.allCategories = translatedTexts.ALL_CATEGORIES;
        self.filterCategories = translatedTexts.FILTER_CATEGORIES;
    });

	var setEarnings = function() {
		self.earnings = [];

		EarningRepository.filter(self.filters).then(function(earnings) {
			self.earnings = earnings;

			self.hasEarnings = earnings.length > 0;

			$ionicScrollDelegate.scrollTop(false);
			$ionicScrollDelegate.resize();
		});
	};
	setEarnings();

	self.goToCurrentMonth = function() {
		if(self.filters.currentMonth.getMonth() == today.getMonth())
			return false;

		self.filters.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		setEarnings();
	}

	self.changeMonth = function(n) {
		if($ionicSideMenuDelegate.getOpenRatio() != 0)
			return false;

		var month = self.filters.currentMonth.getMonth();
		self.filters.currentMonth.setMonth(month + n);
		setEarnings();
	};

	self.isFirst = function(date, $index) {
		return $index == 0 || !isEqualDate(date, self.earnings[$index-1].effectiveDate);
	};

	var isEqualDate = function(date1, date2) {
		return date1.getDate() == date2.getDate() && date1.getMonth() == date2.getMonth() && date1.getFullYear() == date2.getFullYear();
	};

	self.isAllAccounts = function() {
		return self.modalFilters.accounts.length == self.accounts.length;
	}

	self.toggleAllAccounts = function() {
		self.modalFilters.accounts = (self.isAllAccounts() ? [] : angular.copy(self.accounts));
	}

    self.accounts = [];
    AccountRepository.findAll().then(function(accounts) {
        self.accounts = accounts;
    });

	self.isAllCategories = function() {
		return self.modalFilters.categories.length == self.categories.length;
	}

	self.toggleAllCategories = function() {
		self.modalFilters.categories = (self.isAllCategories() ? [] : angular.copy(self.categories));
	}

    self.categories = [];
    CategoryRepository.findByTransaction(1).then(function(categories) {
        self.categories = categories;
    });

    $ionicModal.fromTemplateUrl('earningAccountsFilter.html', {
        scope: $scope,
        animation: 'none'
    }).then(function(modal) {
        self.accountsModal = modal;
    });

    self.showAccounts = function() {
        self.isFilterSelections = true;
        self.accountsFilterStyle = SelectPositionService.calculatePosition('earningAccountsFilter', self.accounts.length + 1);
        self.accountsModal.show();
    };

    $ionicModal.fromTemplateUrl('earningCategoriesFilter.html', {
        scope: $scope,
        animation: 'none'
    }).then(function(modal) {
        self.categoriesModal = modal;
    });

    self.showCategories = function() {
        self.isFilterSelections = true;
        self.categoriesFilterStyle = SelectPositionService.calculatePosition('earningCategoriesFilter', self.categories.length + 1);
        self.categoriesModal.show();
    };

    $ionicModal.fromTemplateUrl('templates/earnings/filters.html', {
        scope: $scope
    }).then(function(modal) {
        self.modal = modal;
    });

    self.saveFilters = function() {
        toSave = true;
        self.modal.hide();
    }

    $scope.$on('modal.hidden', function() {
        if(self.isFilterSelections) {
            self.isFilterSelections = false;
            return;
        }

        if(toSave) {
            angular.copy(self.modalFilters.accounts, self.filters.accounts);
            angular.copy(self.modalFilters.categories, self.filters.categories);

            setEarnings();

            toSave = false;
            return;
        }

        angular.copy(self.filters.accounts, self.modalFilters.accounts);
        angular.copy(self.filters.categories, self.modalFilters.categories);
    });

    $scope.$on('$destroy', function() {
        self.modal.remove();
        self.accountsModal.remove();
        self.categoriesModal.remove();
    });

    self.edit = function(id) {
        $state.go('app.earnings-edit', {'earningId': id});
    }
}])

.controller('EarningFormController', [
'EarningRepository',
'AccountRepository',
'CategoryRepository',
'SelectPositionService',
'$stateParams',
'$scope',
'$translate',
'$filter',
'$ionicScrollDelegate',
'$ionicHistory',
'$ionicModal',
'$ionicPopup',
'$state',
function(
	EarningRepository, 
	AccountRepository, 
	CategoryRepository, 
	SelectPositionService,
	$stateParams, 
	$scope, 
	$translate, 
	$filter,
	$ionicScrollDelegate,
	$ionicHistory, 
	$ionicModal, 
	$ionicPopup, 
	$state) {
	
	var self = this, earningId = $stateParams.earningId;
	self.isEdit = earningId ? true : false;
	if(self.isEdit) {
      var translations = {};
	  $translate(['DELETE_EARNING', 'CANCEL', 'YES']).then(function(translatedTexts) {
	    translations.deleteEarning = translatedTexts.DELETE_EARNING;
	    translations.cancel = translatedTexts.CANCEL;
	    translations.yes = translatedTexts.YES;
	  });

	  if(cachedEarning) {
	  	self.earning = angular.copy(cachedEarning);
	  	cachedEarning = null;
	  } else {
		EarningRepository.findById(earningId).then(function(earning) {
		  self.earning = earning;
		});
	  }

      var deleteEarning = function() {
          $ionicHistory.clearCache();
          EarningRepository.remove(self.earning).then(function() {
              $ionicHistory.goBack();
          });
      }

	  self.delete = function() {
		$ionicPopup.confirm({
	      title: '',
	      cssClass: 'no-head',
	      template: translations.deleteEarning,
	      cancelText: translations.cancel,
	      okText: translations.yes
	    }).then(function(res) {
	      if(res)
	        deleteEarning();
	    });
	  };

	  self.save = function() {
	  	if($scope.form.$valid && self.earning.account && self.earning.category) {
	  	    $ionicHistory.clearCache();
			EarningRepository.edit(angular.copy(self.earning)).then(function() {
				$ionicHistory.goBack();
			});
	  	}
	  }
	} else {
      if(cachedEarning) {
        self.earning = angular.copy(cachedEarning);
        cachedEarning = null;
      } else {
        self.earning = {
          description: '',
          effectiveDate: new Date(),
          received: true
        };
      }

		self.save = function() {
            if($scope.form.$valid && self.earning.account && self.earning.category) {
				$ionicHistory.clearCache();

				EarningRepository.add(angular.copy(self.earning)).then(function() {
					$ionicHistory.goBack();
				});
			}
		};
	}

	AccountRepository.findAllFromView().then(function(accounts) {
		self.accounts = accounts;

		if(!self.isEdit && accounts.length > 0) {
			var account, accountId = $stateParams.accountId;

			if(accountId) {
			  account = $filter('filter')(accounts, {'id': accountId})[0];
			}

			self.earning.account = account ? account : accounts[0];
		}
	});

  $ionicModal.fromTemplateUrl('earningAccounts.html', {
    scope: $scope,
    animation: 'none'
  }).then(function(modal) {
    self.accountsModal = modal;
  });

  self.calculateAccountsPosition = function() {
    return self.accounts ? SelectPositionService.calculatePosition('earningAccounts', self.accounts.length + 1) : 0;
  };

	self.selectAccount = function(account) {
		self.earning.account = account;
		self.accountsModal.hide();
	};

	self.newAccount = function() {
		self.accountsModal.hide().then(function() {
			cachedEarning = angular.copy(self.earning);
	    $state.go('app.accounts-new');
		});
	};

	CategoryRepository.findByTransaction(1).then(function(categories) {
		self.categories = categories;

		if(!self.isEdit) {
			self.earning.category = categories[0];
		}
	});

  $ionicModal.fromTemplateUrl('earningCategories.html', {
    scope: $scope,
    animation: 'none'
  }).then(function(modal) {
    self.categoriesModal = modal;
  });

  self.calculateCategoriesPosition = function() {
		return self.categories ? SelectPositionService.calculatePosition('earningCategories', self.categories.length + 1) : 0;
  }

	self.selectCategory = function(category) {
		self.earning.category = category;
		self.categoriesModal.hide();
	};

	self.newCategory = function() {
		self.categoriesModal.hide().then(function() {
			cachedEarning = angular.copy(self.earning);
	    $state.go('app.categories-new', {transactionType:1});
		});
	};

	self.submit = function() {
		$scope.form.$setSubmitted();
		self.save();
	};

	self.resizeScroll = function() {
		$ionicScrollDelegate.resize();
	};
}]);