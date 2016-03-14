/**
 * Created by giorgiopea on 13/03/16.
 */
(function () {
    var controller = function ($scope, $location,mixedContentToArray,  dataPublisher, configService) {
        var apiDomain = configService.apiDomain;
        var c = this;
        var emailRegex =/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i

        c.mode = {
            modeValue : 0,
            message: 'SIGN IN AS MEMBER',
            changeMode: function (oldmode) {
                if(oldmode === 1){
                    this.message ='SIGN IN AS PLUNNER ORGANIZATION';
                }
                else{
                    this.message = 'SIGN IN AS MEMBER';
                }
                if(oldmode !== this.modeValue){
                    clearFields();
                    jQuery('.signinhub__typeswitch svg:nth-child('+(this.modeValue+1)+')').find('ellipse').attr('fill', '#D8D8D8');
                    this.modeValue = oldmode;
                    jQuery('.signinhub__typeswitch svg:nth-child('+(oldmode+1)+')').find('ellipse').attr('fill', 'rgb(3,169,244)');

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
                }
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
                }
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
            if (c.mode.modeValue === 1) {
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
            console.log(c.invalidFlags.member);
            if (!computeStatus(c.invalidFlags.member)) {
                //authorizationPopup.show();
                dataPublisher.publish(apiDomain + '/employees/auth/login', {
                    company: c.memberInputs.org,
                    email: c.memberInputs.email,
                    password: c.memberInputs.pwd,
                    remember: '1'
                }).then(function () {
                    //authorizationPopup.hide();
                    $location.path('/user')
                }, function (response) {
                    if (response.status === 422) {
                        mixedContentToArray.process(response.data, c.errors.member, true);
                        //authorizationPopup.hide();
                    }
                    //authorizationPopup.hide();
                });
            }
        };

        var signInAsOrg = function () {
            c.errors.member.length = 0;
            c.invalidFlags.org.email.required = c.memberInputs.email === '';
            if(!c.invalidFlags.org.email.required){
                c.invalidFlags.org.email.valid = !emailRegex.test(c.orgInputs.email);
            }
            c.invalidFlags.org.email.overall = c.invalidFlags.org.email.valid && c.invalidFlags.org.email.required;
            c.invalidFlags.org.pwd.required = c.orgInputs.pwd === '';
            c.invalidFlags.org.pwd.length = c.orgInputs.pwd.length < 6;
            c.invalidFlags.org.pwd.overall =  c.invalidFlags.org.pwd.valid && c.invalidFlags.org.pwd.required;
            if (computeStatus(c.invalidFlags.org)) {
                authorizationPopup.show();
                dataPublisher.publish(apiDomain + '/companies/auth/login', {
                    email: c.orgInputs.email,
                    password: c.orgInputs.pwd,
                    remember: '1'
                }).then(function () {
                    authorizationPopup.hide();
                    $location.path('/organization');
                }, function (response) {
                    if (response.status === 422) {
                        mixedContentToArray.process(response.data, c.errors.org, true);
                        authorizationPopup.hide();
                    }
                    authorizationPopup.hide();
                });
            }


        };
        var computeStatus = function(invalidFlags){
            if(!angular.isDefined(invalidFlags.org)){
                return invalidFlags.email.overall || invalidFlags.pwd.overall;
            }
            console.log('enter');
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
        }
    };
    var app = angular.module('Plunner');
    app.controller('signInHubController', ['$scope','$location','mixedContentToArray','dataPublisher','configService', controller]);


}());