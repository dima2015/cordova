(function () {

    var controller = function ($mdDialog, $mdToast, mixedContentToArray, $location, dataPublisher, configService) {

        var c = this;

        c.data = {
            credentials: {
                url: '',
                username: '',
                password: ''
            }
        };
        c.errors = [];
        c.calendars = [];
        c.checkedSchedules = [];
        c.invalidFlags = {
            credentials : {
                url: false,
                url_not_valid: false,
                username: false,
                password: false
            },
            schedules : {
                none : false,
                at_least: false
            }

        };
        var loadingPopup = {
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
        var fillCheckedSchedules = function(schedules){
            for(var i=0; i< schedules.length; i++){
                c.checkedSchedules.push({
                    value : schedules[i],
                    selected : false
                })
            }
        };

        c.getSchedules = function () {
            var areErrors = false;
            var urlRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
            c.invalidFlags.url_valid = false;
            c.invalidFlags.url = (c.data.credentials.url === '');
            if (!c.invalidFlags.url) {
                c.invalidFlags.url_valid = !urlRegex.test(c.data.credentials.url);
            }
            c.invalidFlags.username = (c.data.credentials.username === '');
            c.invalidFlags.password = (c.data.credentials.password === '');

            for (var key in c.invalidFlags.credentials) {
                if (c.invalidFlags[key] === true) {
                    areErrors = true;
                    break;
                }
            }
            if (!areErrors) {
                loadingPopup.message = 'Retrieving schedules';
                loadingPopup.show();
                dataPublisher.publish(configService.apiDomain + '/employees/calendars/calendars', {
                    url: c.data.credentials.url,
                    username: c.data.credentials.username,
                    password: c.data.credentials.password
                }).then(function (response) {
                    c.calendars = response.data;
                    fillCheckedSchedules(response.data);
                    loadingPopup.hide()
                }, function (response) {
                    loadingPopup.hide();
                    if (response.status === 422) {
                        mixedContentToArray.process(response.data, c.errors, true);
                        $mdToast.show(
                            $mdToast.simple()
                                .textContent(c.errors[0])
                                .position('bottom')
                                .hideDelay(3000)
                        );
                    }
                });
            }
        };

        c.submit = function () {
            var areErrors = true;
            var selectedSchedules = [];
            c.invalidFlags.schedules.none = (c.calendars.length === 0);
            for(var i=0; i< c.checkedSchedules.length; i++){
                console.log(areErrors);
                if(c.checkedSchedules[i].selected === true){
                    selectedSchedules.push(c.checkedSchedules[i].value);
                    areErrors = false;
                }
                if(areErrors === true){
                    c.invalidFlags.schedules.schedules.at_least = true;
                }
            }
            if(!(areErrors || c.invalidFlags.schedules.none)){
                loadingPopup.message = 'Saving schedules';
                loadingPopup.show();
                for (i = 0; i < selectedSchedules.length; i++) {
                    dataPublisher.publish(configService.apiDomain + '/employees/calendars/caldav', {
                        name: selectedSchedules[i],
                        url: c.data.credentials.url,
                        username: c.data.credentials.username,
                        password: c.data.credentials.password,
                        calendar_name: selectedSchedules[i],
                        enabled: 1
                    }).then(function () {
                        loadingPopup.confirmPopup.hide();
                        $location.path('/user');

                    }, function (response) {
                        if (response.status === 422) {
                            mixedContentToArray.process(response.data, c.importSchedule.errors, true);
                        }
                        loadingPopup.hide();
                    })
                }
            }






        }


    };

    var app = angular.module('Plunner');
    app.controller('importScheduleController', ['$mdDialog', '$mdToast', 'mixedContentToArray', '$location', 'dataPublisher', 'configService', controller]);


}());