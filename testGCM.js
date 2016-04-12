var GCM = require('gcm').GCM;

var apiKey = '';
var gcm = new GCM(apiKey);

var message = {
    registration_id: 'Device registration id', // required
    collapse_key: 'Collapse key',
    'data.key1': 'value1',
    'data.key2': 'value2'
};

gcm.send(message, function(err, messageId){
    if (err) {
        console.log("Something has gone wrong!");
    } else {
        console.log("Sent with message ID: ", messageId);
    }
});