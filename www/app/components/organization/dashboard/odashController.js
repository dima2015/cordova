(function () {

    var controller = function ($mdDialog,logoutService, orgResources) {

        var c = this;

        var getUsers = function () {
            var pages;
            //employees restful index
            orgResources.orgUser.query({userId: ''}).$promise
                .then(function (response) {
                    c.data.users = response;
                    pages = Math.ceil(c.data.users.length / 10);
                    c.pagination.user.pages = pages;
                    c.pagination.user.utilArray = new Array(pages);
                });
        };
        //Gets groups
        var getGroups = function () {
            var pages;
            //employees restful groups index
            orgResources.orgGroup.query({groupId: ''}).$promise
                .then(function (response) {
                    c.data.groups = response;
                    pages = Math.ceil(c.data.groups.length / 10);
                    c.pagination.groups.pages = pages;
                    c.pagination.groups.utilArray = new Array(pages);
                });
        };
        var confirmPopup = {
            message: 'Signin you out',
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
        c.data = {};
        //Flags for deciding what view show to the user
        c.viewSections = {
            users: true,
            groups: false,
            showUsers: function () {
                this.groups = false;
                this.users = true;
            },
            showGroups: function () {
                this.users = false;
                this.groups = true;
            }
        };
        c.logout = function(){
            confirmPopup.message = 'Signin you out';
            confirmPopup.show();
            setTimeout(function(){
                confirmPopup.hide();
                logoutService.logout('');
            },1000);


        };
        c.openMenu = function($mdOpenMenu, $event){
            $mdOpenMenu($event);
        };
        getUsers();
        getGroups();
    };

    var app = angular.module('Plunner');
    app.controller('odashController', ['$mdDialog','logoutService','orgResources', controller]);
}());
