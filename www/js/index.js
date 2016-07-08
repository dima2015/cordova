/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
    },
    // Bind Event Listeners
    //
    // Bind any events that are required on startup. Common events are:
    // 'load', 'deviceready', 'offline', and 'online'.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
    // deviceready Event Handler
    //
    // The scope of 'this' is the event. In order to call the 'receivedEvent'
    // function, we must explicitly call 'app.receivedEvent(...);'
    onDeviceReady: function() {
        //app.receivedEvent('deviceready');
        //if (window.cordova) { //TODO useless??
            var push = PushNotification.init({
                android: {
                    senderID: "992047859622"
                },
                ios: {
                    alert: "true",
                    badge: "true",
                    sound: "true"
                },
                windows: {}
            });

            push.on('registration', function (data) {
                // data.registrationId
                console.log(data.registrationId);
            });

            push.on('notification', function (data) {
                console.log(data.message);
                alert(data.message);
                // data.message,
                // data.title,
                // data.count,
                // data.sound,
                // data.image,
                // data.additionalData
            });

            push.on('error', function (e) {
                // e.message
                //console.log(e);
                //alert(e);
            });
/*
        navigator.camera.getPicture(onSuccess, onFail, {});

        function onSuccess() {
            console.log("Camera getPicture success.")
        }

        function onFail(message) {
            alert('Failed because: ' + message);
        }*/
       // }
    },
    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
};

var camera = {
    camera: {
        image: null,
        setOptions: function (srcType) {
            var options = {
                // Some common settings are 20, 50, and 100
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                // In this app, dynamically set the picture source, Camera or photo gallery
                sourceType: srcType,
                encodingType: Camera.EncodingType.JPEG,
                mediaType: Camera.MediaType.PICTURE,
                allowEdit: true,
                correctOrientation: true  //Corrects Android orientation quirks
            }
            return options;
        },

        openCamera: function (selection) {

            var srcType = Camera.PictureSourceType.CAMERA;
            var options = this.setOptions(srcType);
            var func = this.createNewFileEntry;
            var _this = this;

            navigator.camera.getPicture(function cameraSuccess(imageUri) {

                _this.image = imageUri;
                _this.displayImage();

            }, function cameraError(error) {
                console.debug("Unable to obtain picture: " + error, "app");

            }, options);
        },

        displayImage: function () {

            var elem = document.getElementById('imageFile');
            document.getElementById('upload').disabled = false;
            elem.src = this.image;
        },

        openFilePicker: function (selection) {

            var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
            var options = this.setOptions(srcType);
            var func = this.createNewFileEntry;
            var _this = this;

            navigator.camera.getPicture(function cameraSuccess(imageUri) {

                _this.image = imageUri;
                _this.displayImage();

            }, function cameraError(error) {
                console.debug("Unable to obtain picture: " + error, "app");

            }, options);
        },
    },

    uploader: {
        loadingStatus:{
            percentage: 0.0,
            setPercentage: function(percentage){
                this.percentage = percentage;
            },
            increment: function(){
                //TODO
            }

        },
        win: function (r) {
            console.log("Code = " + r.responseCode);
            console.log("Response = " + r.response);
            console.log("Sent = " + r.bytesSent);
        },

        fail: function (error) {
            alert("An error has occurred: Code = " + error.code);
            console.log("upload error source " + error.source);
            console.log("upload error target " + error.target);
        },

        upload: function (groupId, meetingId) {
            var uri = encodeURI('http://api.plunner.com/employees/planners/groups/'+groupId+'/meetings/'+meetingId+'/image');
            var _this = this;
            var options = new FileUploadOptions();
            options.fileKey = "file";
            console.log(camera.camera.image);
            options.fileName = camera.camera.image.substr(camera.camera.image.lastIndexOf('/') + 1);
            options.mimeType = "image/jpg";

            var headers = { 'Authorization': 'Bearer '+window.localStorage['auth_token']};

            options.headers = headers;

            var ft = new FileTransfer();
            ft.onprogress = function (progressEvent) {
                if (progressEvent.lengthComputable) {
                    _this.loadingStatus.setPercentage(progressEvent.loaded / progressEvent.total);
                } else {
                    _this.loadingStatus.increment();
                }
            };
            ft.upload(camera.camera.image, uri, this.win, this.fail, options);
        }
    }
};

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
}