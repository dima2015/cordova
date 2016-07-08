(function () {

    var controller = function ($mdDialog, $location, orgResources) {

        var c = this;
        var emailRegex =/^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i;
        var confirmPopup = {
            message: 'Adding member',
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
        c.data = {
            name : '',
            email : '',
            pwd: ''
        };
        c.invalidFields = {
            name : false,
            email : false,
            password : false
        };
        c.errors = [];
        c.contact = function(){
            navigator.contacts.pickContact(function(contact){
                console.log(contact);
                c.data.name = contact.displayName;
                c.data.email = contact.emails[0].value;
            },function(err){
                console.log('Error: ' + err); //TODO show error
            });
        };

        c.submit = function(){
            c.invalidFields.name = (c.data.name === '');
            c.invalidFields.email = !emailRegex.test(c.data.email);
            c.invalidFields.password = (c.data.pwd.length < 6);
            if(!c.invalidFields.name && !c.invalidFields.email && !c.invalidFields.password){
                confirmPopup.show();
                orgResources.orgUser.save({userId: ''}, jQuery.param({
                    name: c.data.name,
                    email: c.data.email,
                    password: c.data.pwd,
                    password_confirmation: c.data.pwd
                })).$promise
                    .then(function () {
                            confirmPopup.hide();
                            $location.path('/');
                        },
                        function (response) {
                            if (response.status === 422) {
                                mixedContentToArray.process(response.data, c.errors, true);
                                confirmPopup.hide();
                            }
                            confirmPopup.hide();
                        });
            }
        }
    };

    var app = angular.module('Plunner');
    app.controller('userAddController', ['$mdDialog','$location','orgResources', controller]);
}());
