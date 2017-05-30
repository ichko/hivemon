let { DeviceManager } = require('./app/device-manager');
let { HiveMonitor } = require('./app/monitor');
let { HiveApi } = require('./app/api');


let port = 3000;
let monitoringDelay = 5000;
let apiCredentials = {
    username: 'admin',
    password: 'admin'
};
let espCredentials = {
    username: 'admin',
    password: 'admin'
};


new DeviceManager().init('mongodb://localhost:27017/hive').then(repository => {
    let api = new HiveApi(repository, apiCredentials);
    let monitor = new HiveMonitor({
        credentials: espCredentials,
        repository,
        frequency: monitoringDelay,
        logger: console.log
    });
    repository.setSensor(
        { name: 'hiveTemperature', displayName: 'Hive temperature' },
        { name: 'piloTemperature', displayName: 'Pilo temperature' },
        { name: 'light', displayName: 'Light' },
        { name: 'humidity', displayName: 'Humidity' }
    );
    repository.setDevice(
        'all',
        { name: 'hive0', url: '0.0.0.0', location: 'Sofia', displayName: 'Hive 0' },
        { name: 'hive1', url: '0.0.0.1', location: 'Sofia', displayName: 'Hive 1' }
    );
    // repository.addSensorData('hive0', 'light', 600, new Date())
    // repository.addSensorData('hive0', 'light', 10, new Date())
    // repository.addSensorData('hive0', 'hiveTemperature', 10, new Date())
    // repository.addSensorData('hive0', 'humidity', [1, 2, 3], new Date());

    console.log(`Monitoring and api (port: ${ port }) initiated...`);
    monitor.start();
    api.start(port);
})
.catch(console.log);
