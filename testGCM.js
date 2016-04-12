var GCM = require('gcm').GCM;

var apiKey = process.argv[2];
var gcm = new GCM(apiKey);

var message = {
    registration_id: process.argv[3], //'Device registration id', // required
    collapse_key: 'Collapse key',
    'data.key1': 'value1',
    'data.key2': 'value2'
};

gcm.send(message, function(err, messageId){
    if (err) {
        console.log("Something has gone wrong!"+ err);
    } else {
        console.log("Sent with message ID: ", messageId);
    }
});