(function(){

    var directive = function(){

        return {
            restrict: 'A',
            controller : ['$routeParams', '$scope', function ($routeParams, $scope) {
                $scope.reference = '';
                $scope.advice = 'go back to dashboard';
                this.decideRedirect = function () {
                    var token = window.localStorage['auth_token'];
                    var mode;

                    if(token !== undefined){
                        mode = jwt_decode(token).mode;
                        if(mode === 'en'){
                            $scope.reference = '/#/user'
                        }
                        else if(mode === 'cn'){
                            $scope.reference = '/#/organization'
                        }
                    }
                    else {
                        $scope.reference = '/#/';
                        $scope.advice = 'GO BACK TO SIGN IN'
                    }

                }
            }],
            link: function (scope, element, attrs, controllers) {
                controllers.decideRedirect();
            }
        }
    };

    var app = angular.module('Plunner');
    app.directive('redirecterror', directive);

}());