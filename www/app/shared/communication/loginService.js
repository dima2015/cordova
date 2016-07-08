(function(){
    //A service that manages the logout of an organization or an employee
    var service = function($location,$cookies){
        return {
            login : function(url){

            }
        }
    };

    var app = angular.module('Plunner');
    app.factory('loginService', service);
}());
