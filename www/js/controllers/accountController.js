angular.module('accountController', [])

.controller('AccountController', [
'AccountRepository',
'$state',
function(AccountRepository, $state) {
	var self = this;

	self.currentYear = new Date().getFullYear();
	self.accounts = [];

	var setAccounts = function() {
		AccountRepository.findAllFromView().then(function(accounts) {
			self.accounts = accounts;

			self.hasAccounts = accounts.length > 0;
		});
	}
	setAccounts();

	self.newTransfer = function() {
		if(self.accounts.length < 2)
			return false;

		$state.go('app.transfer');
	}

	self.edit = function(accountId) {
		$state.go('app.accounts-edit', {'accountId': accountId});
	}
}])

.controller('AccountFormController', [
'AccountRepository', 
'$stateParams', 
'$scope', 
'$ionicHistory', 
'$ionicPopup', 
'$translate',
function(AccountRepository, $stateParams, $scope, $ionicHistory, $ionicPopup, $translate) {
	var self = this, accountId = $stateParams.accountId;
	self.isEdit = accountId ? true : false;

	if(self.isEdit) {
		var translations = {};
	  $translate(['DELETE_ACCOUNT', 'CANCEL', 'YES']).then(function(translatedTexts) {
	    translations.deleteAccount = translatedTexts.DELETE_ACCOUNT;
	    translations.cancel = translatedTexts.CANCEL;
	    translations.yes = translatedTexts.YES;
	  });

		AccountRepository.findById(accountId).then(function(account) {
			self.account = account;
		});

		var confirmDelete = function() {
			$ionicHistory.clearCache();

			AccountRepository.remove(accountId).then(function() {
				$ionicHistory.goBack();
			});
		}

		self.delete = function() {
			$ionicPopup.confirm({
	      title: '',
	      cssClass: 'no-head',
	      template: translations.deleteAccount,
	      cancelText: translations.cancel,
	      okText: translations.yes
	    }).then(function(res) {
	      if(res)
	        confirmDelete();
	    });
	  };
	} else {
		self.account = {
			icon: 'icon-wallet',
			iconColorR: 128,
			iconColorG: 128,
			iconColorB: 128
		};
	}

	self.submit = function() {
		$scope.form.$setSubmitted();
		self.save();
	}

	self.save = function() {
		if($scope.form.$valid) {
			$ionicHistory.clearCache();
			
			if(self.isEdit) {
				AccountRepository.edit(angular.copy(self.account)).then(function() {
					$ionicHistory.goBack();
				});
			} else {
				AccountRepository.add(angular.copy(self.account)).then(function() {
					$ionicHistory.goBack();
				});
			}
		}
	}
}])

.controller('AccountTransferController', [
'AccountRepository',
'SelectPositionService',
'$scope', 
'$ionicHistory', 
'$ionicModal',
function(AccountRepository, SelectPositionService, $scope, $ionicHistory, $ionicModal) {
	var self = this;
	self.accounts = [];
	self.transfer = {
		description: '',
		effectiveDate: new Date()
	};

	AccountRepository.findAll().then(function(accounts) {
		self.accounts = accounts;
		self.transfer.from = accounts[0];
		self.transfer.to = accounts[1];
	});

	$ionicModal.fromTemplateUrl('accountsFrom.html', {
    scope: $scope,
    animation: 'none'
  }).then(function(modal) {
    self.accountsFromModal = modal;
  });

	self.calculateAccountsFromPosition = function() {
		return SelectPositionService.calculatePosition('accountFrom', self.accounts.length);
	}

	self.selectAccountFrom = function(account) {
		self.transfer.from = account;
		self.accountsFromModal.hide();
	};

	$ionicModal.fromTemplateUrl('accountsTo.html', {
    scope: $scope,
    animation: 'none'
  }).then(function(modal) {
    self.accountsToModal = modal;
  });

	self.calculateAccountsToPosition = function() {
		return SelectPositionService.calculatePosition('accountTo', self.accounts.length);
	}

	self.selectAccountTo = function(account) {
		self.transfer.to = account;
		self.accountsToModal.hide();
	};

	self.submit = function() {
		$scope.form.$setSubmitted();
		self.save();
	};

	self.save = function() {
		if($scope.form.$valid && self.isValidAccounts()) {
			$ionicHistory.clearCache();
			
			AccountRepository.addTransfer(angular.copy(self.transfer)).then(function() {
				$ionicHistory.goBack();
			});
		}
	};

	self.isValidAccounts = function() {
		return self.transfer.to && self.transfer.from && self.transfer.to.id != self.transfer.from.id;
	}
}]);