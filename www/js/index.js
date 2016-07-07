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
                console.log(e);
                alert(e);
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
    setOptions: function(srcType) {
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

            _this.displayImage(imageUri);
            // You may choose to copy the picture, save it somewhere, or upload.
            //func(imageUri);

        }, function cameraError(error) {
            console.debug("Unable to obtain picture: " + error, "app");

        }, options);
    },

    displayImage: function (imgUri) {

        var elem = document.getElementById('imageFile');
        elem.src = imgUri;
    },

    openFilePicker: function(selection) {

        var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
        var options = this.setOptions(srcType);
        var func = this.createNewFileEntry;
        var _this = this;

        navigator.camera.getPicture(function cameraSuccess(imageUri) {

            // Do something
            _this.displayImage(imageUri);

        }, function cameraError(error) {
            console.debug("Unable to obtain picture: " + error, "app");

        }, options);
    },

    getFileEntry: function (imgUri) {
        window.resolveLocalFileSystemURL(imgUri, function success(fileEntry) {

            // Do something with the FileEntry object, like write to it, upload it, etc.
            // writeFile(fileEntry, imgUri);
            console.log("got file: " + fileEntry.fullPath);
            // displayFileData(fileEntry.nativeURL, "Native URL");

        }, function () {
            // If don't get the FileEntry (which may happen when testing
            // on some emulators), copy to a new FileEntry.
            this.createNewFileEntry(imgUri);
        });
    },

    createNewFileEntry: function (imgUri) {
        window.resolveLocalFileSystemURL(cordova.file.cacheDirectory, function success(dirEntry) {

            // JPEG file
            dirEntry.getFile("tempFile.jpeg", { create: true, exclusive: false }, function (fileEntry) {

                // Do something with it, like write to it, upload it, etc.
                // writeFile(fileEntry, imgUri);
                console.log("got file: " + fileEntry.fullPath);
                // displayFileData(fileEntry.fullPath, "File copied to");

            }, onErrorCreateFile);

        }, onErrorResolveUrl);
    }
};