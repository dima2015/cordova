(function () {
    var app = angular.module('Plunner');

    app.run(function ($mdDialog,$rootScope, $location) {

        //Route filtering
        $rootScope.$on("$routeChangeStart", function (event, next) {
            //Gets the decoded jwt
            var mode, token, path;
            token = window.localStorage['auth_token'];
            //Gets the url the user want to reach
            path = next.originalPath;

            if (token) {
                mode = jwt_decode(token).mode;
            }
            //Mode checking(organizations)
            if (path) {
                if (path.search('organization') !== -1) {
                    if (mode === undefined || mode !== 'cn') {
                        $location.path('/');
                    }
                    else {
                        $location.path('/organization')
                    }
                }
                //Mode checking(employees)
                else if (path.search('user') !== -1) {

                    if (mode === undefined || mode !== 'en') {
                        $location.path('/');
                    }
                    else  {
                        $location.path('/user')
                    }
                }
                //Redirect if the user is already logged in
                /*else if (path.search('/orgsignin') !== -1) {
                    if (mode === 'cn') {
                        $location.path('/organization');
                    }
                }
                else if (path.search('/usersignin') !== -1) {
                    if (mode === 'en') {
                        $location.path('/user');
                    }
                }*/
            }
        });
    });
    /*
     app.run(function($cordovaPush) {

     alert("test");
     var androidConfig = {
     "senderID": "992047859622",
     };

     document.addEventListener("deviceready", function(){
     alert("test2");
     $cordovaPush.register(androidConfig).then(function(result) {
     // Success
     }, function(err) {
     // Error
     })

     $rootScope.$on('$cordovaPush:notificationReceived', function(event, notification) {
     switch(notification.event) {
     case 'registered':
     if (notification.regid.length > 0 ) {
     alert('registration ID = ' + notification.regid);
     }
     break;

     case 'message':
     // this is the actual push notification. its format depends on the data model from the push server
     alert('message = ' + notification.message + ' msgCount = ' + notification.msgcnt);
     break;

     case 'error':
     alert('GCM error = ' + notification.msg);
     break;

     default:
     alert('An unknown GCM event has occurred');
     break;
     }
     });


     // WARNING: dangerous to unregister (results in loss of tokenID)
     $cordovaPush.unregister(options).then(function(result) {
     // Success!
     }, function(err) {
     // Error
     })

     }, false);
     });*/
}());
