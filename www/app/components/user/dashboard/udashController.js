(function () {

    var controller = function ($mdDialog,$scope, dataPublisher, mixedContentToArray, userResources, plannerResources, configService, objectResetFields, logoutService) {

        /*
         Gets the meetings relative to a given group.
         These meetings are stored in the meetings properties of the given group.
         These meetings are provided as an array of objects. Each of these objects represents a meeting
         and contains also the name of the group the meeting refers to

         */
        var processMeetings = function (groups) {
            var meetingsContainer = [];
            var tmp;
            for (var i = 0; i < groups.length; i++) {
                for (var j = 0; j < groups[i].meetings.length; j++) {
                    tmp = groups[i].meetings[j];
                    tmp.group_name = groups[i].name;
                    meetingsContainer.push(tmp);
                }
            }
            console.log(meetingsContainer);
            return meetingsContainer;

        };
        /*
         Separates imported schedules from composed schedules. This is achieved using the caldav property
         of a schedule, which is null if the schedule is composed
         */
        var processSchedules = function (schedules) {
            var importedSchedules = [];
            var composedSchedules = [];
            var tmp;
            for (var i = 0; i < schedules.length; i++) {
                tmp = schedules[i];
                if (tmp.caldav == null) {
                    composedSchedules.push(tmp);
                }
                else {
                    importedSchedules.push(tmp);
                }
            }
            return {
                importedSchedules: importedSchedules,
                composedSchedules: composedSchedules
            };
        };
        var c = this;
        var getSchedules = function () {
            userResources.userSchedule.query({calendarId: ''})
                .$promise.then(function (response) {
                    var processedSchedules = processSchedules(response);
                    console.log(processedSchedules);
                    c.schedules.imported = processedSchedules.importedSchedules;
                c.schedules.composed = processedSchedules.composedSchedules;
                c.finishLoading.imported = true;
                c.finishLoading.composed = true;
                });
        };
        var getMeetings = function () {
            userResources.userGroups.query({current : 1})
                .$promise.then(function (response) {
                    c.meetings.toBePlanned = processMeetings(response);
                c.finishLoading.to_be_planned = true;
                });
            userResources.userPlannedMeetings.query({meetingId: '', current: 1})
                .$promise.then(function (response) {
                    c.meetings.planned = response;
                c.finishLoading.planned = true;

                });
        };
        var getManagedMeetings = function () {
            plannerResources.plannerManagedMeetings.query({current: 1})
                .$promise.then(function (response) {
                    c.meetings.managed = processMeetings(response);
                c.finishLoading.managed = true;
                });

        };
        var getUserInfo = function () {
            userResources.userInfo.get()
                .$promise.then(function (response) {
                    c.userInfo.is_planner = response.is_planner;
                    if (c.userInfo.is_planner) {
                        getManagedMeetings();
                    }
                })
        };
        c.finishLoading = {
            to_be_planned : false,
            planned : false,
            managed : false,
            composed : false,
            imported : false
        };
        //Flags for deciding what view show to the user
        c.viewSections = {
            meetings: {
                to_be_planned : true,
                planned : false,
                managed : false,
                last: 'to_be_planned'
            },
            schedules: {
                composed : true,
                imported : false,
                last: 'composed'
            },
            changeMeetingsView : function(viewString){
                var last = this.meetings.last;
                if(viewString !==  last){
                    jQuery('#udash__'+last+'-meetings').removeClass('animated slideInRight');
                    jQuery('#udash__'+viewString+'-meetings').addClass('animated slideInRight');
                    this.meetings[last] = false;
                    this.meetings[viewString] = true;
                    this.meetings.last = viewString;

                }
            },
            changeSchedulesView : function(viewString){
                var last = this.schedules.last;
                if(viewString !== last){
                    jQuery('#udash__'+last+'-schedules').removeClass('animated slideInRight');
                    jQuery('#udash__'+viewString+'-schedules').addClass('animated slideInRight');
                    this.schedules[last] = false;
                    this.schedules[viewString] = true;
                    this.schedules.last = viewString;
                }
            }
        };
        c.userInfo = {
            is_planner: false
        };
        c.meetings = {
            planned: [],
            toBePlanned: [],
            managed: []
        };
        c.schedules = {
            imported: [],
            composed: []
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
        c.openMenu = function($mdOpenMenu, $event){
          $mdOpenMenu($event);
        };
        c.logout = function(){
            c.confirmPopup.message = 'Signin you out';
            c.confirmPopup.show();
            setTimeout(function(){
                c.confirmPopup.hide();
                logoutService.logout('');
            },1000);


        };
        getUserInfo();
        getSchedules();
        getMeetings();
    };

    var app = angular.module('Plunner');
    app.controller('udashController', ['$mdDialog','$scope', 'dataPublisher', 'mixedContentToArray', 'userResources', 'plannerResources', 'configService','objectResetFields','logoutService', controller]);
}());
