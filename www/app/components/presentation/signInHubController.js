/**
 * Created by giorgiopea on 13/03/16.
 */
(function () {
    var controller = function ($scope, $location,mixedContentToArray,  dataPublisher, configService, $mdDialog) {
        var apiDomain = configService.apiDomain;
        var c = this;
        var emailRegex =/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;

        c.mode = {
            modeValue : 0,

            changeMode: function (oldmode) {
                if(oldmode !== this.modeValue){
                    clearFields();
                    this.modeValue = oldmode;
                }

            }
        };
        c.invalidFlags = {
            member : {
                org : false,
                email : {
                    overall : false,
                    required : false,
                    valid : false
                },
                pwd : {
                    overall : false,
                    required : false,
                    valid : false
                },
                problems : false
            },
            org : {
                email : {
                    overall : false,
                    required : false,
                    valid : false
                },
                pwd : {
                    overall : false,
                    required : false,
                    valid : false
                },
                problems : false
            }
        };

        c.errors = {
            member : [],
            org : []
        };

        c.memberInputs = {
            org: '',
            email: '',
            pwd: ''
        };

        c.orgInputs = {
            email: '',
            pwd: ''
        };

        c.signIn = function () {
            if (c.mode.modeValue === 0) {
                signInAsOrg();
            }
            else {
                signInAsMember();
            }
        };



        var signInAsMember = function () {
            c.errors.member.length = 0;
            c.invalidFlags.member.org = c.memberInputs.org === '';
            c.invalidFlags.member.email.required = c.memberInputs.email === '';
            if(!c.invalidFlags.member.email.required){
                c.invalidFlags.member.email.valid = !emailRegex.test(c.memberInputs.email);
            }
            c.invalidFlags.member.email.overall = c.invalidFlags.member.email.valid || c.invalidFlags.member.email.required;
            c.invalidFlags.member.pwd.required = c.memberInputs.pwd === '';
            c.invalidFlags.member.pwd.length = c.memberInputs.pwd.length < 6;
            c.invalidFlags.member.pwd.overall =  c.invalidFlags.member.pwd.valid || c.invalidFlags.member.pwd.required;
            if(computeStatus(c.invalidFlags.member)){
                c.invalidFlags.member.problems = true;
            }
            if (!computeStatus(c.invalidFlags.member)) {
                c.invalidFlags.member.problems = false;
                confirmPopup.show();
                //authorizationPopup.show();
                dataPublisher.publish(apiDomain + '/employees/auth/login', {
                    company: c.memberInputs.org,
                    email: c.memberInputs.email,
                    password: c.memberInputs.pwd,
                    remember: '1'
                }).then(function () {
                    //authorizationPopup.hide();
                    confirmPopup.hide();
                    $location.path('/user')
                }, function (response) {
                    if (response.status === 422) {
                        mixedContentToArray.process(response.data, c.errors.member, true);
                        confirmPopup.hide();
                        //authorizationPopup.hide();
                    }
                    //authorizationPopup.hide();
                });
            }
        };

        var signInAsOrg = function () {
            c.errors.member.length = 0;
            c.invalidFlags.org.email.required = c.orgInputs.email === '';
            if(!c.invalidFlags.org.email.required){
                c.invalidFlags.org.email.valid = !emailRegex.test(c.orgInputs.email);
            }
            c.invalidFlags.org.email.overall = c.invalidFlags.org.email.valid && c.invalidFlags.org.email.required;
            c.invalidFlags.org.pwd.required = c.orgInputs.pwd === '';
            c.invalidFlags.org.pwd.overall = c.invalidFlags.org.pwd.required;
            if(computeStatus(c.invalidFlags.org)){
                c.invalidFlags.org.problems = true;
            }
            if (!computeStatus(c.invalidFlags.org)) {
                confirmPopup.show();
                c.invalidFlags.org.problems = false;
                dataPublisher.publish(apiDomain + '/companies/auth/login', {
                    email: c.orgInputs.email,
                    password: c.orgInputs.pwd,
                    remember: '1'
                }).then(function () {
                    confirmPopup.hide();
                    $location.path('/organization');
                }, function (response) {
                    if (response.status === 422) {
                        mixedContentToArray.process(response.data, c.errors.org, true);
                    }
                    confirmPopup.hide();
                });
            }


        };
        var confirmPopup = {
            message: 'Signin you in',
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
        var computeStatus = function(invalidFlags){
            if(!angular.isDefined(invalidFlags.org)){
                return invalidFlags.email.overall || invalidFlags.pwd.overall;
            }
            return invalidFlags.email.overall || invalidFlags.pwd.overall || invalidFlags.org;
        };
        var clearFields = function(){
            c.memberInputs.org = '';
            c.memberInputs.email = '';
            c.memberInputs.pwd = '';
            c.orgInputs.email = '';
            c.orgInputs.pwd = '';
            c.errors.member.length = 0;
            c.errors.org.length = 0;
            var orgFields =  c.invalidFlags.org;
            var memeberFields = c.invalidFlags.member;
            for(key in orgFields){
                if(!angular.isObject(orgFields[key])){
                    orgFields[key] = false;
                }
                else {
                    for(key_one in orgFields[key]){
                        orgFields[key][key_one] = false
                    }
                }
            }
            for(key in memeberFields){
                if(!angular.isObject(memeberFields[key])){
                    orgFields[key] = false;
                }
                else {
                    for(key_one in memeberFields[key]){
                        memeberFields[key][key_one] = false
                    }
                }
            }
        }

    };
    var app = angular.module('Plunner');
    app.controller('signInHubController', ['$scope','$location','mixedContentToArray','dataPublisher','configService','$mdDialog', controller]);


}());