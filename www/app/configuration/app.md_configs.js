/**
 * Created by giorgiopea on 13/03/16.
 */
(function (){
    var app = angular.module('Plunner');
    app.config(function($mdThemingProvider) {
        $mdThemingProvider.theme('default')
            .primaryPalette('light-blue')
            .accentPalette('amber');
    });
}());
