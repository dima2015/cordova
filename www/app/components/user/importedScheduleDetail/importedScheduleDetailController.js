(function(){

    var controller = function($routeParams,$mdDialog, $location, userResources){



        var c = this;
        var scheduleId = $routeParams.id;
        var caldav;

        var  loadingPopup = {
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
        var enabledValueAdapter = function (argument, forBackend) {
            switch (forBackend) {
                case true :
                    if (argument === 'DISABLED') {
                        return '0';
                    }
                    else {
                        return '1';
                    }
                    break;
                default :
                    if (argument === '0') {
                        return 'DISABLED';
                    }
                    else {
                        return 'ENABLED';
                    }
                    break;
            }
        };
        var getSchedule = function(){
            userResources.userSchedule.get({calendarId: scheduleId})
                .$promise
                .then(function(response){
                    c.data.name = response.name;
                    c.data.updated_at = response.updated_at;
                    c.data.enabled = enabledValueAdapter(response.enabled, false);
                    caldav = response.caldav;

                })
        };

        c.deleteSchedule = function(){
            loadingPopup.message = 'Deleting schedule';
            loadingPopup.show();
            userResources.userSchedule.remove({calendarId: scheduleId})
                .$promise
                .then(function(){
                    loadingPopup.hide();
                    $location.path('/user')
                })
        };

        c.saveSchedule = function(){
            loadingPopup.message = 'Saving changes';
            loadingPopup.show();
            userResources.userSchedule.update({calendarId: scheduleId},
            jQuery.param({
                name : c.data.name,
                enabled : enabledValueAdapter(c.data.enabled, true),
                caldav_name : caldav.caldav_name,
                url : caldav.url,
                username : caldav.username
            }))
                .$promise
                .then(function(response){
                    loadingPopup.hide();
                    $location.path('/user');
                })
        };


        c.data = {
            name : '',
            updated_at : '',
            enabled : ''
        };

        getSchedule();
    };

    var app = angular.module('Plunner');
    app.controller("importedScheduleDetailController",['$routeParams','$mdDialog','$location','userResources',controller]);



}());