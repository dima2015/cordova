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

        myNfc.init();
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

var myNfc = {
    reading: false,

    init: function(){
        var _this = this;
        nfc.addNdefListener (
            function (nfcEvent) {
                if(_this.reading)
                    return;
                _this.reading = true;
                var tag = nfcEvent.tag,
                    ndefMessage = tag.ndefMessage;

                // dump the raw json of the message
                // note: real code will need to decode
                // the payload from each record
                //alert(JSON.stringify(ndefMessage));

                // assuming the first record in the message has
                // a payload that can be converted to a string.
                //alert(nfc.bytesToString(ndefMessage[0].payload).substring(3));
                //alert(nfc.bytesToString(ndefMessage[0].payload));
                _this.login(nfc.bytesToString(ndefMessage[0].payload).substring(3));
            },
            function () { // success callback
                //alert("Waiting for NDEF tag");
            },
            function (error) { // error callback
                //alert("Error adding NDEF listener " + JSON.stringify(error));
                console.log("Error adding NDEF listener " + JSON.stringify(error));
            }
        );
    },

    login: function(id){
        var _this = this;
        var token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoiZW4iLCJyZW1lbWJlciI6ImZhbHNlIiwic3ViIjoiMzQiLCJpc3MiOiJodHRwOlwvXC9hcGkucGx1bm5lci5jb21cL2VtcGxveWVlc1wvYXV0aFwvbG9naW4iLCJpYXQiOiIxNDc1MDY2OTA5IiwiZXhwIjoiMTQ3NTA3MDUwOSIsIm5iZiI6IjE0NzUwNjY5MDkiLCJqdGkiOiI1ZDczYTVlYjhhZWY5ZmI4NDY0MTRmZTNiNjdiM2M3NSJ9.iM5c_tffkIZkQ9zHS1XRIejZA2jfOIRZKU53RjL1zuo';
        switch(id){
            case '1':
                token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoiZW4iLCJyZW1lbWJlciI6ImZhbHNlIiwic3ViIjoiMzQiLCJpc3MiOiJodHRwOlwvXC9hcGkucGx1bm5lci5jb21cL2VtcGxveWVlc1wvYXV0aFwvbG9naW4iLCJpYXQiOiIxNDc1MDY2OTA5IiwiZXhwIjoiMTQ3NTA3MDUwOSIsIm5iZiI6IjE0NzUwNjY5MDkiLCJqdGkiOiI1ZDczYTVlYjhhZWY5ZmI4NDY0MTRmZTNiNjdiM2M3NSJ9.iM5c_tffkIZkQ9zHS1XRIejZA2jfOIRZKU53RjL1zuo';
                break;
            case '2':
                token = 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJtb2RlIjoiZW4iLCJyZW1lbWJlciI6ImZhbHNlIiwic3ViIjoiNzYzIiwiaXNzIjoiaHR0cDpcL1wvYXBpLnBsdW5uZXIuY29tXC9lbXBsb3llZXNcL2F1dGhcL2xvZ2luIiwiaWF0IjoiMTQ3NTAwMjg4MiIsImV4cCI6IjE0NzUwMDY0ODIiLCJuYmYiOiIxNDc1MDAyODgyIiwianRpIjoiYTJkZDFhYTM0ZmM5YTgwYzhlODhkMzkxMmE1OTliODEifQ.ydERTG6C7ny-Zu6YPeyjCKkkVdks40UMifcesQ3dsPg';
                break;
        };
        var r = confirm("Are you sure that you want to login with RFID?");
        if (r == true) {
            window.localStorage.removeItem('auth_token');
            window.localStorage.setItem('auth_token',token);
            window.location.hash = '#/user';
        }
        setTimeout(function(){_this.reading = false;}, 100); //to avoid a train of requests (there is a queue of requests to discard)
    },
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
            options.fileName = camera.camera.image.substr(camera.camera.image.lastIndexOf('/') + 1);
            options.mimeType = "image/jpeg";

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
