(function () {

    var controller = function ($mdDialog,$location,arrayToUrlParams,mixedContentToArray,$scope,orgResources) {

        var c = this;
        c.data = {
            name : '',
            description :'',
            users : []
        };
        var selectMemberListener = function(){
            jQuery(document).on('touchend click','.lapalaa li', function(){
                var elem = jQuery(this);
                var checkmark = elem.find('md-icon');
                var id = elem.attr('id');
                var index = -1;
                for(var i=0; i< c.selectedMembers.length; i++){
                    if(c.selectedMembers[i].id === id+''){
                        index = i;
                        break;
                    }
                }
                var name = elem.find('p').text();
                if(index !== -1){
                    checkmark.removeAttr('style');
                    c.selectedMembers.splice(index,1);
                    console.log(c.selectedMembers)
                }
                else{
                    checkmark.css('display','block');
                    c.selectedMembers.push({id : id, name : name});
                }
            })
        };
        c.removeMember = function(index){
            c.showMembers.splice(index,1);
        };
        c.makePlunner = function(index, id){
            c.addGroup.planner.index = index;
            c.addGroup.planner.id = id

        };
        c.moveItems = function(){
            c.showMembers = c.selectedMembers;
            jQuery('.lapalaa li').find('md-icon').removeAttr('style');
            c.selectedMembers = [];
        };
        c.showMembers = [];
        c.selectedMembers = [];
        var elaborateUsers = function(urs){
            var targetArray=[];
            var tmpArray = [];
            for(var i=0; i<urs.length; i++){
                if(i%4 === 0){
                    targetArray.push(tmpArray);
                    tmpArray = [];
                }
                tmpArray.push(urs[i]);
            }
            if(tmpArray.length !== 0){
                targetArray.push(tmpArray);
            }
            return targetArray;
        };
        var getUsers = function () {
            orgResources.orgUser.query({userId: ''}).$promise
                .then(function (response) {
                    c.data.users = elaborateUsers(response);
                });
        };
        var confirmPopup = {
            message: 'Adding group',
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
        c.addGroup = {
            planner: {index:undefined, id:undefined},
            members: [],
            name: '',
            desc: '',
            errors: [],
            invalidFields: {
                nameReq: false,
                plannerReq: false,
                descReq: false,
                membersReq: false
            },
            submit: function () {
                var validationStatus;
                var validMembers=[];

                //Checks tha validity status of input fields
                this.invalidFields.nameReq = (c.data.name === '');
                this.invalidFields.membersReq = (c.showMembers.length === 0);
                this.invalidFields.plannerReq = (this.planner.index == null || angular.isUndefined(this.planner.index));
                this.invalidFields.descReq = (c.data.description === '');

                validationStatus = this.invalidFields.descriptionReq || this.invalidFields.nameReq || this.invalidFields.membersReq || this.invalidFields.plannerReq;
                //Submits everything to the server if data is valid
                if (!validationStatus) {
                    for(var i=0; i< c.showMembers.length; i++){
                        validMembers.push(c.showMembers[i].id);
                    }
                    confirmPopup.show();
                    //Updates the group name and planner
                    orgResources.orgGroup.save({groupId: ''}, jQuery.param({
                        name: c.data.name,
                        planner_id: c.addGroup.planner.id,
                        description: c.data.description
                    })).$promise
                        .then(function (response) {
                                //Updates the group members
                                orgResources.orgUserInGroup.save({
                                    groupId: response.id,
                                    userId: ''
                                }, arrayToUrlParams.process('id', validMembers)).$promise
                                    .then(function () {
                                        confirmPopup.hide();
                                        $location.path('/organization')
                                    }, function (response) {
                                        //Puts relevant errors in array
                                        if (response.status === 422) {
                                            mixedContentToArray.process(response.data, c.addGroup.errors, true);
                                            confirmPopup.hide();
                                        }
                                        confirmPopup.hide();
                                    })
                            },
                            function (response) {
                                //Puts relevant errors in array
                                if (response.status === 422) {
                                    mixedContentToArray.process(response.data, c.addGroup.errors, true);
                                    confirmPopup.hide();
                                }
                                confirmPopup.hide();
                            });
                }
            }
        };



        selectMemberListener();
        getUsers();
    };

    var app = angular.module('Plunner');
    app.controller('groupAddController', ['$mdDialog','$location','arrayToUrlParams','mixedContentToArray','$scope','orgResources', controller]);
}());
