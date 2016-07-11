(function () {

    var controller = function ($mdDialog,$routeParams, $location, mixedContentToArray, orgResources, arrayToUrlParams) {

        var c = this;
        //group id
        var id = $routeParams.id;
        var getUsers = function () {
            orgResources.orgUserInGroup.query({groupId: id, userId: ''}).$promise
                .then(function (response) {
                    c.showMembers = response;
                    c.finishLoading = true;
                    c.data.ownUsers = response;
                    for(var i=0; i< c.data.ownUsers.length; i++){
                        c.selectedMembers.push({id : c.data.ownUsers[i].id, name: c.data.ownUsers[i].name});
                    }
                })
        };
        var getAllpossibleUsers = function(){
            orgResources.orgUser.query({userId: ''}).$promise
                .then(function (response) {
                    c.data.users = response;
                    c.data.members = elaborateUsers(response);
                });

        };

        //Gets user info in the context of an organization
        var getGroupInfo = function () {
            //restful show
            orgResources.orgGroup.get({groupId: id}).$promise
                .then(function (response) {
                    c.data.name = response.name;
                    c.data.description = response.description;
                    c.planner.id = response.planner_id;
                });
        };
        c.data = {
            name : '',
            description : '',
            members : [],
            users : [],
            ownUsers : []
        };
        c.finishLoading = false;
        c.errors = {
            planner: [],
            info: []
        };
        c.showMembers = [];
        c.planner = {
            id: '',
            index: ''
        };
        c.invalidFields = {
            nameReq: false,
            descReq : false,
            membersReq: false,
            plannerReq: false
        };
        var selectMemberListener = function(){
            jQuery(document).on('touchend click','.group__users li', function(){
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
                }
                else{
                    checkmark.css('display','block');
                    c.selectedMembers.push({id : id, name : name});
                }
            })
        };
        c.makePlunner = function(index, id){
            c.planner.index = index;
            c.planner.id = id

        };
        c.moveItems = function(){
            c.showMembers = [];
            c.showMembers = c.selectedMembers;
            jQuery('.group__users li').find('md-icon').removeAttr('style');
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

        //Delete an employee in the context of an org
        c.delete = function () {
            //restful delete
            confirmPopup.message = "Deleting group";
            confirmPopup.show();
            orgResources.orgGroup.remove({groupId: id}).$promise
                .then(function () {
                    confirmPopup.hide();
                    $location.path('/organization')
                }, function(){
                    c.confirmPopup.hide();
                });
        };
        //Update user info
        c.update = function () {
            //Checks the validity status of input fields
            c.invalidFields.nameReq = (c.data.name === '');
            c.invalidFields.descReq = (c.data.description === '');
            c.invalidFields.membersReq = (c.showMembers.length === 0);
            c.invalidFields.plannerReq = c.planner.id === '';

            if (!c.invalidFields.nameReq && !c.invalidFields.descReq && !c.invalidFields.membersReq && !c.invalidFields.plannerReq) {
                confirmPopup.message = "Saving changes";
                confirmPopup.show();
                orgResources.orgGroup.update({groupId: id}, jQuery.param(
                    {
                        name: c.data.name,
                        description: c.data.description,
                        planner_id: c.planner.id
                    })).$promise
                    .then(function () {
                        updateMembers();
                    }, function (response) {
                        if (response.status === 422) {
                            mixedContentToArray.process(response.data, c.errors.info, true);
                            confirmPopup.hide();
                        }
                        confirmPopup.hide();
                    });
            }
        };
        var updateMembers = function(){
            var bool = true;
            var firstId=[],secondId=[],finalId = [];
            for(var i=0; i < c.showMembers.length; i++){
                firstId.push(c.showMembers[i].id);
            }
            for(i=0; i<c.data.ownUsers.length; i++){
                secondId.push(c.data.ownUsers[i].id);
            }
            for(i=0; i < firstId.length; i++){
                for(var j=0; j< secondId.length; j++){
                    if(firstId[i] === secondId[j]){
                        bool = false;
                        break;
                    }
                }
                if(bool){
                    finalId.push(firstId[i])
                }
                bool = true;

            }
            if(finalId.length !== 0){
                c.data.name = '';
                c.data.description = '';
                c.data.members.length = 0;
                c.data.users.length = 0;
                c.data.ownUsers.length = 0;
                orgResources.orgUserInGroup.save({
                    groupId: id,
                    userId: ''
                }, arrayToUrlParams.process('id', finalId)).$promise
                    .then(function () {
                        getGroupInfo()
                        getUsers();
                        confirmPopup.hide();
                    }, function (response) {
                        //Puts relevant errors in array
                        if (response.status === 422) {
                            mixedContentToArray.process(response.data, c.errors.planner, true);
                            confirmPopup.hide();

                        }
                        confirmPopup.hide();
                    })
            }
            else{
                getGroupInfo();
                confirmPopup.hide();
            }

        };
        c.removeMember = function (userId) {
            c.showMembers = [];
            c.data.ownUsers = [];
            c.selectedMembers = [];
            confirmPopup.message = "Removing member";
            confirmPopup.show();

            orgResources.orgUserInGroup.remove({groupId: id, userId: userId}).$promise
                .then(
                function () {
                    getUsers();
                    confirmPopup.hide();
                }, function(){
                    confirmPopup.hide();
                }
            )
        };

        getGroupInfo();
        getUsers();
        getAllpossibleUsers();
        selectMemberListener();

    };
    var app = angular.module('Plunner');
    app.controller('groupController', ['$mdDialog','$routeParams', '$location', 'mixedContentToArray', 'orgResources', 'arrayToUrlParams', controller]);
}());
