/**
 * Created by giorgiopea on 13/03/16.
 */
(function () {
    var controller = function ($scope, dataPublisher) {

        var c = this;

        c.mode = {
            modeValue : 0,
            message: 'SIGN IN AS MEMBER',
            changeMode: function () {
                this.modeValue = 1 - modeValue;
            }
        };

        c.memberSignInErrors = [];
        c.orgSignInErrors = [];

        c.memberInputs = {
            org: '',
            email: '',
            pwd: ''
        };

        c.orgInputs = {
            email: '',
            pwd: ''
        };

        c.signIn = function () {
            if (mode === 1) {
                signInAsOrg();
            }
            else {
                signInAsMember();
            }
        };

        var signInAsMember = function () {
            c.memberSignInErrors.length = 0;
            if (!$scope.memberSignin.$invalid) {
                authorizationPopup.show();
                dataPublisher.publish(apiDomain + '/employees/auth/login', {
                    company: c.memberInputs.org,
                    email: c.memberInputs.email,
                    password: c.memberInputs.pwd,
                    remember: '1'
                }).then(function (response) {
                    authorizationPopup.hide();
                    $location.path('/user')
                }, function (response) {
                    if (response.status === 422) {
                        mixedContentToArray.process(response.data, c.errors, true);
                        authorizationPopup.hide();
                    }
                    authorizationPopup.hide();
                });
            }
        };

        var signInAsOrg = function () {
            c.memberSignInErrors.length = 0;
            if ($scope.orgSignIn.$invalid) {
                authorizationPopup.show();
                dataPublisher.publish(apiDomain + '/companies/auth/login', {
                    email: c.orgInputs.email,
                    password: c.orgInputs.pwd,
                    remember: '1'
                }).then(function () {
                    authorizationPopup.hide();
                    $location.path('/organization');
                }, function (response) {
                    if (response.status === 422) {
                        mixedContentToArray.process(response.data, c.errors, true);
                        authorizationPopup.hide();
                    }
                    authorizationPopup.hide();
                });
            }


        }
    };
    angular.module('Plunner').controller('signInHubController', ['$scope','dataPublisher', controller]);


}());