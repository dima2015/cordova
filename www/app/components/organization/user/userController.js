(function () {

    var controller = function ($mdDialog,$scope, $routeParams, $location, mixedContentToArray, orgResources) {
        var c = this;
        //user id
        var id = $routeParams.id;
        /*var emptyInvalidFields = function (invalidFields) {
            for (var key in invalidFields) {
                invalidFields[key] = false;
            }
        };*/
        var manipulateGroups = function(groups){
            var tmpGroups = [];
            for(var i=0; i<groups.length; i++){
                tmpGroups.push({group: groups[i], selected: true });
            }
            return tmpGroups;
        };
        var confirmPopup = {
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
        c.edit = false;
        c.editInfo = function(){
            c.edit = true;
        };
        c.data = {};
        c.dataCopy = {
            pwd : '',
            r_pwd: '',
            groups : []
        };
        //Get user info in the context of an org
        var getInfo = function () {
            //restful show
            orgResources.orgUser.get({userId: id}).$promise
                .then(function (response) {
                    c.data = response;
                    c.dataCopy.groups = manipulateGroups(response.groups);
                });
        };
        //Delete an user in the context of an org
        c.delete = function () {
            //restful delete
            confirmPopup.message = 'Deleting user';
            confirmPopup.show();
            orgResources.orgUser.remove({userId: id}).$promise
                .then(function () {
                    confirmPopup.hide();
                    $location.path('/organization');

                }, function(){
                    c.confirmPopup.hide();
                });
        };
        c.update = {
            thereErrors: false,
            invalidFields: {
                passwordLength: false,
                passwordMatch: false
            },
            errors: [],
            submit: function () {
                this.invalidFields.passwordLength = (c.dataCopy.pwd.length < 6);
                this.invalidFields.passwordMatch = (c.dataCopy.password !== c.dataCopy.password_confirmation);
                if (!this.invalidFields.passwordLength && !this.invalidFields.passwordMatch) {
                    confirmPopup.message = 'Saving changes';
                    confirmPopup.show();
                    orgResources.orgUser.update({userId: id}, jQuery.param({
                        name : c.data.name,
                        email : c.data.email,
                        password: c.dataCopy.pwd,
                        password_confirmation: c.dataCopy.pwd
                    })).$promise
                        .then(function () {
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
        c.removeFromGroup = function (id) {
            confirmPopup.message = 'Removing member from group';
            confirmPopup.show();
            orgResources.orgUserInGroup.remove({groupId: id, userId: c.data.id})
                .$promise.then(function () {
                    for(var i=0; i< c.dataCopy.groups.length; i++){
                        if(c.dataCopy.groups[i].group.id === id+''){
                            c.dataCopy.groups.splice(i,1);
                        }
                    }
                    confirmPopup.hide();
                },function(){
                    confirmPopup.hide();
                })
        };
        getInfo();
    };


    var app = angular.module('Plunner');
    app.controller('userController', ['$mdDialog','$scope', '$routeParams', '$location', 'mixedContentToArray', 'orgResources', controller]);
}());
