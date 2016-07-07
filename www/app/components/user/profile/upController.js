(function () {

    var controller = function ($mdDialog, $scope, userResources, mixedContentToArray) {

        var c = this;

        c.data = {
            name: '',
            email: ''
        };
        c.edit = false;
        c.editInfo = function () {
            c.edit = true;
        };
        c.confirmPopup = {
            message: '',
            show: function () {
                $mdDialog.show({
                        template: '<md-dialog><md-dialog-content><div class="md-dialog-content plan_meeting__submit_dialog" layout="row"><md-progress-circular flex="33" md-mode="indeterminate"></md-progress-circular> <span flex>' + this.message + '</span> </div> </md-dialog-content> </md-dialog>',
                        parent: angular.element(document.body),
                        clickOutsideToClose: false
                    }
                );
            },
            hide: function () {
                $mdDialog.cancel();
            }
        };

        c.getInfo = function () {
            userResources.userInfo.get().$promise
                .then(function (response) {
                    c.data.name = response.name;
                    c.data.email = response.email;
                });
        };
        c.editMode = {
            flag: false,
            enter: function () {
                this.flag = true;
            },
            exit: function () {
                c.update.errors = [];
                c.update.invalidFields.passwordMatch = false;
                c.update.invalidFields.passwordLength = false;
                c.update.invalidFields.nameReq = false;
                c.dataCopy.password = '';
                c.dataCopy.password_confirmation = '';
                this.flag = false;
            }
        };
        c.dataCopy = {
            name: '',
            password: '',
            password_confirmation: ''
        };
        c.update = {
            invalidFields: {
                passwordLength: false,
                passwordMatch: false
            },
            errors: [],
            submit: function () {
                c.update.invalidFields.passwordLength = (c.dataCopy.password.length < 6);
                c.update.invalidFields.passwordMatch = (c.dataCopy.password !== c.dataCopy.password_confirmation);
                if (!(c.update.invalidFields.passwordLength || c.update.invalidFields.passwordMatch)) {
                    toSend = {
                        name: c.data.name,
                        email: c.data.name,
                        password: c.dataCopy.password,
                        password_confirmation: c.dataCopy.password
                    };
                    c.confirmPopup.message = 'Saving changes';
                    c.confirmPopup.show();
                    userResources.userInfo.update(jQuery.param(toSend)).$promise
                        .then(function () {
                            c.dataCopy.password = '';
                            c.dataCopy.password_confirmation = '';
                            //Update view
                            c.edit = false;
                            c.getInfo();
                            c.confirmPopup.hide();
                        }, function (response) {
                            if (response.status === 422) {
                                mixedContentToArray.process(response.data, c.update.errors, true);
                                c.confirmPopup.hide();
                            }
                            c.confirmPopup.hide();
                        })
                }


            }

        };
        c.getInfo();


    };

    var app = angular.module('Plunner');
    app.controller('upController', ['$mdDialog', '$scope', 'userResources', 'mixedContentToArray', controller]);

}());
