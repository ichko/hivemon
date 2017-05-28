const request = require('request-promise');

const options = {
    method: 'GET',
    uri: 'http://192.168.1.115/'
};

request(options)
    .then(function (response) {
        console.log(response);
    })
    .catch(function (err) {
        // Something bad happened, handle the error
    });

new HiveMonitor()
    .each(500)
    .monitor(db.hiveClusterConfig);
