angular.module('categoryController', [])

.controller('CategoryController', [
'CategoryRepository',
'$state',
'$translate',
'$cordovaToast',
function(CategoryRepository, $state, $translate, $cordovaToast) {
	var self = this, translations = {};
    $translate(['CANT_EDIT_CATEGORY']).then(function(translatedTexts) {
        translations.cantEditCategory = translatedTexts.CANT_EDIT_CATEGORY;
    });

	self.earningCategories = [];
	self.expenseCategories = [];

	var setEarningCategories = function() {
		CategoryRepository.findByTransaction(1).then(function(earningCategories) {
			self.earningCategories = earningCategories;
		});
	}
	setEarningCategories();

	var setExpenseCategories = function() {
		CategoryRepository.findByTransaction(2).then(function(expenseCategories) {
			self.expenseCategories = expenseCategories;
		});
	}
	setExpenseCategories();

	self.edit = function(category) {
		if(category.isDeletable)
			$state.go('app.categories-edit', {'categoryId': category.id});
		else
			$cordovaToast.show(translations.cantEditCategory, 'short', 'bottom');
	}
}])

.controller('CategoryFormController', [
'CategoryRepository', 
'$scope', 
'$stateParams', 
'$ionicHistory', 
'$ionicPopup', 
'$translate',
function(CategoryRepository, $scope, $stateParams, $ionicHistory, $ionicPopup, $translate) {
	var self = this, categoryId = $stateParams.categoryId;
	self.isEdit = categoryId ? true : false;

	if(self.isEdit) {
		var translations = {};
	  $translate(['DELETE_CATEGORY', 'CANCEL', 'YES']).then(function(translatedTexts) {
	    translations.deleteCategory = translatedTexts.DELETE_CATEGORY;
	    translations.cancel = translatedTexts.CANCEL;
	    translations.yes = translatedTexts.YES;
	  });

		CategoryRepository.findById(categoryId).then(function(category) {
			self.category = category;
		});

		var confirmDelete = function() {
			$ionicHistory.clearCache();

			CategoryRepository.remove(categoryId).then(function() {
				$ionicHistory.goBack();
			});
		}

		self.delete = function() {
			$ionicPopup.confirm({
	      title: '',
	      cssClass: 'no-head',
	      template: translations.deleteCategory,
	      cancelText: translations.cancel,
	      okText: translations.yes
	    }).then(function(res) {
	      if(res)
	        confirmDelete();
	    });
	  };
	} else {
		self.category = {
			icon: 'icon-tags',
			iconColorR: 128,
			iconColorG: 128,
			iconColorB: 128,
			transactionType: $stateParams.transactionType ? $stateParams.transactionType : 1,
			isDeletable: 1
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
				CategoryRepository.edit(angular.copy(self.category)).then(function() {
					$ionicHistory.goBack();
				});
			} else {
				CategoryRepository.add(angular.copy(self.category)).then(function() {
					$ionicHistory.goBack();
				});
			}
		}
	}
}]);