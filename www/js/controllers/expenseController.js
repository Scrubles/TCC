var cachedExpense = null;

angular.module('expenseController', [])

.controller('ExpenseController', [
'ExpenseRepository',
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
    ExpenseRepository, 
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

	var setExpenses = function() {
		self.expenses = [];

		ExpenseRepository.filter(self.filters).then(function(expenses) {
			self.expenses = expenses;

			self.hasExpenses = expenses.length > 0;

			$ionicScrollDelegate.scrollTop(false);
			$ionicScrollDelegate.resize();
		});
	};
	setExpenses();

	self.goToCurrentMonth = function() {
		if(self.filters.currentMonth.getMonth() == today.getMonth())
			return false;

		self.filters.currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
		setExpenses();
	}

	self.changeMonth = function(n) {
		if($ionicSideMenuDelegate.getOpenRatio() != 0)
			return false;

		var month = self.filters.currentMonth.getMonth();
		self.filters.currentMonth.setMonth(month + n);
		setExpenses();
	};

	self.isFirst = function(date, $index) {
		return $index == 0 || !isEqualDate(date, self.expenses[$index-1].effectiveDate);
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
    CategoryRepository.findByTransaction(2).then(function(categories) {
        self.categories = categories;
    });

    $ionicModal.fromTemplateUrl('expenseAccountsFilter.html', {
        scope: $scope,
        animation: 'none'
    }).then(function(modal) {
        self.accountsModal = modal;
    });

    self.showAccounts = function() {
        self.isFilterSelections = true;
        self.accountsFilterStyle = SelectPositionService.calculatePosition('expenseAccountsFilter', self.accounts.length + 1);
        self.accountsModal.show();
    };

    $ionicModal.fromTemplateUrl('expenseCategoriesFilter.html', {
        scope: $scope,
        animation: 'none'
    }).then(function(modal) {
        self.categoriesModal = modal;
    });

    self.showCategories = function() {
        self.isFilterSelections = true;
        self.categoriesFilterStyle = SelectPositionService.calculatePosition('expenseCategoriesFilter', self.categories.length + 1);
        self.categoriesModal.show();
    };

    $ionicModal.fromTemplateUrl('templates/expenses/filters.html', {
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

            setExpenses();

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
        $state.go('app.expenses-edit', {'expenseId': id});
    }
}])

.controller('ExpenseFormController', [
'ExpenseRepository',
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
	ExpenseRepository, 
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
	
	var self = this, expenseId = $stateParams.expenseId;
	self.isEdit = expenseId ? true : false;
	if(self.isEdit) {
      var translations = {};
	  $translate(['DELETE_EXPENSE', 'CANCEL', 'YES']).then(function(translatedTexts) {
	    translations.deleteExpense = translatedTexts.DELETE_EXPENSE;
	    translations.cancel = translatedTexts.CANCEL;
	    translations.yes = translatedTexts.YES;
	  });

	  if(cachedExpense) {
	  	self.expense = angular.copy(cachedExpense);
	  	cachedExpense = null;
	  } else {
		ExpenseRepository.findById(expenseId).then(function(expense) {
		  self.expense = expense;
		});
	  }

      var deleteExpense = function() {
          $ionicHistory.clearCache();
          ExpenseRepository.remove(self.expense).then(function() {
              $ionicHistory.goBack();
          });
      }

	  self.delete = function() {
		$ionicPopup.confirm({
	      title: '',
	      cssClass: 'no-head',
	      template: translations.deleteExpense,
	      cancelText: translations.cancel,
	      okText: translations.yes
	    }).then(function(res) {
	      if(res)
	        deleteExpense();
	    });
	  };

	  self.save = function() {
	  	if($scope.form.$valid && self.expense.account && self.expense.category) {
	  	    $ionicHistory.clearCache();
			ExpenseRepository.edit(angular.copy(self.expense)).then(function() {
				$ionicHistory.goBack();
			});
	  	}
	  }
	} else {
      if(cachedExpense) {
        self.expense = angular.copy(cachedExpense);
        cachedExpense = null;
      } else {
        self.expense = {
          description: '',
          effectiveDate: new Date(),
          paid: true
        };
      }

		self.save = function() {
            if($scope.form.$valid && self.expense.account && self.expense.category) {
				$ionicHistory.clearCache();

				ExpenseRepository.add(angular.copy(self.expense)).then(function() {
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

			self.expense.account = account ? account : accounts[0];
		}
	});

  $ionicModal.fromTemplateUrl('expenseAccounts.html', {
    scope: $scope,
    animation: 'none'
  }).then(function(modal) {
    self.accountsModal = modal;
  });

  self.calculateAccountsPosition = function() {
    return self.accounts ? SelectPositionService.calculatePosition('expenseAccounts', self.accounts.length + 1) : 0;
  };

	self.selectAccount = function(account) {
		self.expense.account = account;
		self.accountsModal.hide();
	};

	self.newAccount = function() {
		self.accountsModal.hide().then(function() {
			cachedExpense = angular.copy(self.expense);
	    $state.go('app.accounts-new');
		});
	};

	CategoryRepository.findByTransaction(2).then(function(categories) {
		self.categories = categories;

		if(!self.isEdit) {
			self.expense.category = categories[0];
		}
	});

  $ionicModal.fromTemplateUrl('expenseCategories.html', {
    scope: $scope,
    animation: 'none'
  }).then(function(modal) {
    self.categoriesModal = modal;
  });

  self.calculateCategoriesPosition = function() {
		return self.categories ? SelectPositionService.calculatePosition('expenseCategories', self.categories.length + 1) : 0;
  }

	self.selectCategory = function(category) {
		self.expense.category = category;
		self.categoriesModal.hide();
	};

	self.newCategory = function() {
		self.categoriesModal.hide().then(function() {
			cachedExpense = angular.copy(self.expense);
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