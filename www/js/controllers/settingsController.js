angular.module('settingsController', [])
.controller('SettingsController', [
'CategoryRepository',
'SelectPositionService',
'$scope',
'$q',
'$ionicModal',
'$state', 
'$window',
'$translate',
function(CategoryRepository, SelectPositionService, $scope, $q, $ionicModal, $state, $window, $translate) {
	var self = this;

    var locale = $window.localStorage.getItem('locale');
    self.selectedLanguage = locale ? locale : 'en-us';
    self.languages = ['en-us', 'pt-br']; 

        $ionicModal.fromTemplateUrl('languages.html', {
        scope: $scope,
        animation: 'none'
    }).then(function(modal) {
        self.languagesModal = modal;
    });

    self.showLanguages = function() {
    self.languagesStyle = SelectPositionService.calculatePosition('languages', self.languages.length);
        self.languagesModal.show();
    };

    self.selectLanguage = function(language) {
        if(language == self.selectedLanguage) {
            self.languagesModal.hide();
            return false;
        }

        $translate.use(language).then(function() {
            var promises = [CategoryRepository.changeNames(language)];
            
            $q.all(promises).then(function() {
                $window.localStorage.setItem('locale', language);
                $window.location.reload();
                $state.go('app.accounts');
            });
        });
    };

    $scope.$on('$destroy', function() {
        self.languagesModal.remove();
    });
}]);