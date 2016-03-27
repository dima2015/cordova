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

        c.invalidFlags = {
            url: false,
            url_not_valid: false,
            username: false,
            password: false
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

            for (key in c.invalidFlags) {
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

            c.invalidFlags.schedules.none = c.calendars.length === 0;
            if (!getSelectedSchedules(this.calendars)) {
                this.errors.push('Select at least one schedule to import');
            }
            else {
                c.confirmPopup.message = 'Importing schedules';
                c.importSchedule.popUp.hide();
                c.confirmPopup.show();
                var selectedCalendars = getSelectedSchedules(this.calendars);
                for (var i = 0; i < selectedCalendars.length; i++) {
                    dataPublisher.publish(apiDomain + '/employees/calendars/caldav', {
                        name: selectedCalendars[i],
                        url: this.credentials.url,
                        username: this.credentials.username,
                        password: this.credentials.password,
                        calendar_name: selectedCalendars[i],
                        enabled: 1
                    }).then(function () {
                        getSchedules();
                        c.confirmPopup.hide();
                    }, function (response) {
                        if (response.status === 422) {
                            mixedContentToArray.process(response.data, c.importSchedule.errors, true);
                            c.confirmPopup.hide();
                            c.importSchedule.popUp.show();
                        }
                        c.confirmPopup.hide();
                    })
                }

            }
        }


    };

    var app = angular.module('Plunner');
    app.controller('importScheduleController', ['$mdDialog', '$mdToast', 'mixedContentToArray', '$location', 'dataPublisher', 'configService', controller]);


}());