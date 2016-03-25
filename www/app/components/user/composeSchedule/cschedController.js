(function () {

    var controller = function ($mdDialog, userResources, mixedContentToArray, $routeParams, $location) {

        var calendar;
        var scheduleId;
        var isUpdate = false;
        var changedEvents = [];
        var c = this;
        var _evs = [];
        var checkNewEvents = function (events) {
            var newEvents = [];
            for (var i = 0; i < events.length; i++) {
                if (events[i].new === true) {
                    newEvents.push(events[i]);
                }
            }
            return newEvents;
        };
        var backendEventAdapter = function (events, switcher) {
            var adaptedEvents = [];
            if (switcher) {
                for (var i = 0; i < events.length; i++) {
                    adaptedEvents.push({
                        time_start: events[i]._start._d.toISOString().split('.')[0].replace('T', ' '),
                        time_end: events[i]._end._d.toISOString().split('.')[0].replace('T', ' ')
                    })
                }
            }
            else {
                adaptedEvents[0] = [];
                adaptedEvents[1] = [];
                for (var key in events) {
                    adaptedEvents[0].push(events[key].specificId);
                    adaptedEvents[1].push({
                        time_start: events[key]._start._d.toISOString().split('.')[0].replace('T', ' '),
                        time_end: events[key]._end._d.toISOString().split('.')[0].replace('T', ' ')
                    })
                }
            }

            return adaptedEvents;

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
        var processUrl = function () {
            if (!($routeParams.type.length === 1 && $routeParams.type === '_')) {
                isUpdate = true;
                var urlParams = $routeParams.type.split('&');
                scheduleId = urlParams[0];
                c.data.schedule.name = urlParams[1];
                c.data.schedule.status = enabledValueAdapter(urlParams[2], false);
                c.toolbarTitle = 'Edit schedule'
            }
        };
        var getTimeslots = function () {
            var splittedTimeStart, splittedTimeEnd;
            if (isUpdate) {
                userResources.userScheduleTimeslots.query({calendarId: scheduleId, timeslotId: ''})
                    .$promise.then(function (response) {
                    for (var i = 0; i < response.length; i++) {
                        splittedTimeStart = response[i].time_start.split(' ');
                        splittedTimeEnd = response[i].time_end.split(' ');
                        _evs.push({
                            title: '',
                            start: splittedTimeStart[0] + 'T' + splittedTimeStart[1],
                            end: splittedTimeEnd[0] + 'T' + splittedTimeEnd[1],
                            specificId: response[i].id
                        });


                    }
                    if (window.innerWidth <= 768) {
                        calendarConfig.defaultView = 'agendaDay';
                    }
                    calendar = jQuery('#composeScheduleCal').fullCalendar(calendarConfig);
                })
            }
            else {
                if (window.innerWidth <= 768) {
                    calendarConfig.defaultView = 'agendaDay';
                }
                calendar = jQuery('#composeScheduleCal').fullCalendar(calendarConfig);
            }

        };
        var removeTimeslot = function (id) {
            c.confirmPopup.message = 'Deleting event';
            c.confirmPopup.show();
            userResources.userScheduleTimeslots.remove({calendarId: scheduleId, timeslotId: id}).$promise
                .then(function () {
                    c.confirmPopup.hide();
                }, function () {
                    c.confirmPopup.hide();
                })
        };
        var updateScheduleTimeslots = function (schedule_id, events) {
            var index = 0;
            for (var i = 0; i < events[1].length; i++) {
                userResources.userScheduleTimeslots.update({
                        calendarId: schedule_id,
                        timeslotId: events[0][i]
                    },
                    jQuery.param(events[1][i])).$promise.then(function () {
                    if (index === events[1].length - 1) {
                        c.confirmPopup.hide();
                        $location.path('/user');

                    }
                    index++;

                }, function (response) {
                    if (response.status === 422) {
                        mixedContentToArray.process(response.data, c.errors, true);
                        c.confirmPopup.hide();
                    }
                    c.confirmPopup.hide();
                });
            }
        };
        var updateSchedule = function () {
            var newEvents, modifiedEvents, alsoEditEvents, enabled, events;
            c.confirmPopup.message = 'Saving schedule';
            c.confirmPopup.show();
            events = calendar.fullCalendar('clientEvents');
            newEvents = backendEventAdapter(checkNewEvents(events), true);
            modifiedEvents = backendEventAdapter(changedEvents, false);
            alsoEditEvents = modifiedEvents[1].length > 0;
            enabled = enabledValueAdapter(c.data.schedule.status, true);
            userResources.userSchedule.update({calendarId: scheduleId}, jQuery.param({
                name: c.data.schedule.name,
                enabled: enabled
            })).$promise.then(function () {
                saveScheduleTimeslots(scheduleId, newEvents, alsoEditEvents);
                updateScheduleTimeslots(scheduleId, modifiedEvents[1]);
                if (newEvents.length === 0 && modifiedEvents[1].length === 0) {
                    c.confirmPopup.hide();
                    $location.path('/user');
                }
            }, function (response) {
                if (response.status === 422) {
                    mixedContentToArray.process(response.data, c.errors, true);
                    c.confirmPopup.hide();
                }
                c.confirmPopup.hide();
            });
        };
        var saveScheduleTimeslots = function (schedule_id, events, alsoEditEvents) {
            var index = 0;
            for (var i = 0; i < events.length; i++) {
                userResources.userScheduleTimeslots.save({calendarId: schedule_id, timeslotId: ''},
                    jQuery.param(events[i])).$promise.then(function () {
                    if (index === events.length - 1 && !alsoEditEvents) {
                        c.confirmPopup.hide();
                        $location.path('/user');
                    }
                    index++;
                }, function (response) {
                    if (response.status === 422) {
                        mixedContentToArray.process(response.data, c.errors, true);
                        c.confirmPopup.hide();
                    }
                    c.confirmPopup.hide();
                });
            }
        };

        var createSchedule = function () {
            var enabled = enabledValueAdapter(c.data.schedule.status, true);
            var events = calendar.fullCalendar('clientEvents');
            c.confirmPopup.message = 'Creating schedule';
            c.confirmPopup.show();
            var processedEvents = backendEventAdapter(events, true);
            userResources.userSchedule.save({calendarId: ''}, jQuery.param({
                name: c.data.schedule.name,
                enabled: enabled
            })).$promise.then(function (response) {
                saveScheduleTimeslots(response.id, processedEvents, false);
            }, function (response) {
                if (response.status === 422) {
                    mixedContentToArray.process(response.data, c.errors, true);
                    c.confirmPopup.hide();
                }
                c.confirmPopup.hide();
            })
        };
        var calendarConfig = {
            firstDay: 1,
            allDaySlot: false,
            header: {
                right: 'prev,next today'
            },
            defaultView: 'agendaWeek',
            slotDuration: '00:15:00',
            events: _evs,
            editable: true,
            selectable: true,
            selectHelper: true,
            select: function (start, end) {
                calendar.fullCalendar('renderEvent',
                    {
                        start: start,
                        end: end,
                        new: true
                    },
                    true // make the event "stick"
                );
                calendar.fullCalendar('unselect');
            },
            eventResize: function (event) {
                if (event.new !== true) {
                    changedEvents[event._id] = event;
                }
            },
            eventDrop: function (event) {
                if (event.new !== true) {
                    changedEvents[event._id] = event;
                }
            },
            eventRender: function (event, element) {
                element.append("<i class='material-icons removeEvent'>close</i>");
                element.find(".removeEvent").click(function () {
                    if (isUpdate) {
                        removeTimeslot(event.specificId);
                    }
                    calendar.fullCalendar('removeEvents', event._id);
                });
            }
        };
        c.events = [];
        c.errors = [];
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
        c.getMode = function () {
            return isUpdate;
        };

        c.deleteSchedule = function () {
            c.confirmPopup.message = 'Deleting schedule';
            c.confirmPopup.show();
            userResources.userSchedule.remove({calendarId: scheduleId})
                .$promise.then(function () {
                c.confirmPopup.hide();
                $location.path('/user')
            }, function () {
                c.confirmPopup.hide();
            })
        };
        c.submit = function () {
            var events = calendar.fullCalendar('clientEvents');
            c.invalidFlags.schedule = c.data.schedule.name === '';
            c.invalidFlags.events = (events.length === 0);
            if (!(c.invalidFlags.schedule || c.invalidFlags.events)) {
                if (!isUpdate) {
                    createSchedule();
                }
                else {
                    updateSchedule();
                }
            }
        };
        c.data = {
            schedule: {
                name: '',
                status: 'ENABLED'
            }
        };
        c.invalidFlags = {
            schedule: false,
            events: false
        };
        c.toolbarTitle = 'Add schedule';
        processUrl();
        getTimeslots();
    };
    var app = angular.module('Plunner');
    app.controller('cschedController', ['$mdDialog', 'userResources', 'mixedContentToArray', '$routeParams', '$location', controller]);

}());
