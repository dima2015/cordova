(function () {

    var controller = function ($scope, orgResources, mixedContentToArray) {

        var c = this;

        c.data = {
            name: '',
            email: ''
        };
        c.edit = false;
        c.editInfo = function () {
            c.edit = true;
        };
        var getInfo = function () {
            orgResources.orgInfo.get().$promise
                .then(function (response) {
                    c.data.name = response.name;
                    c.data.email = response.email;
                });
        };
        c.confirmPopup = {
            message: 'Saving changes',
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
                        c.confirmPopup.show();
                        toSend = {
                            name: c.data.name,
                            email: c.data.email,
                            password: c.dataCopy.password,
                            password_confirmation: c.dataCopy.password
                        };
                        orgResources.orgInfo.update(jQuery.param(toSend)).$promise
                            .then(function () {
                                c.dataCopy.password = '';
                                c.dataCopy.password_confirmation = '';
                                //Update view
                                getInfo();
                                c.edit = false;
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
        getInfo();
    };

    var app = angular.module('Plunner');
    app.controller('opController', ['$scope', 'orgResources', 'mixedContentToArray', controller]);

}());
