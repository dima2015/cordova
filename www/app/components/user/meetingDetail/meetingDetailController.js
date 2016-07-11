(function(){

    var controller = function($routeParams, userResources){
        var c = this;
        c.id = $routeParams.id;
        var params = {
            groupId : $routeParams.group_id,
            id : $routeParams.id,
            isPlanned : $routeParams.is_planned
        };
        var processMeetings = function (group) {
            var tmp;
            for (var j = 0; j < group.meetings.length; j++) {
                tmp = group.meetings[j];
                if(tmp.id === params.id){
                    tmp.group_name = group.name;
                    break;
                }
            }
            return tmp;

        };
        var fillMeetingFields = function(meetingObj){
            c.meeting.title = meetingObj.title;
            c.meeting.desc = meetingObj.description;
            c.meeting.group = meetingObj.group_name;
            c.meeting.duration = parseInt(meetingObj.duration)/60;
            c.meeting.starts = meetingObj.start_time;

        };
        var getMeeting = function(){
          if(params.isPlanned === '1'){
              getPlannedMeeting();
          }else{
              getToBePlannedMeeting();
          }
        };
        var getToBePlannedMeeting = function(){
            var meeting;
            userResources.userGroups.query({current : 1})
                .$promise.then(function (response) {
                for(var i=0; i<response.length; i++){
                    if(response[i].id === params.groupId){
                        meeting = processMeetings(response[i]);
                        break;
                    }
                }
                fillMeetingFields(meeting);
            });
        };
        var getPlannedMeeting = function(){
            userResources.userPlannedMeetings.get({meetingId: c.id, current: 1})
                .$promise.then(function (response) {
                fillMeetingFields(response);
            });
        };


        c.meeting = {
            title : '',
            desc : '',
            group : '',
            duration : '',
            starts : ''
        };
        getMeeting();
    };

    var app = angular.module('Plunner');
    app.controller('meetingDetailController',['$routeParams','userResources', controller]);



}());