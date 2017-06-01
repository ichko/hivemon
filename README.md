# Hivemon
IOT project for monitoring bee hives

### Usage
```javascript
let { DeviceManager } = require('./app/device-manager');
let { HiveMonitor } = require('./app/monitor');
let { HiveApi } = require('./app/api');


let port = 3001;
let monitoringDelay = 5000;
let apiCredentials = {
    username: 'admin',
    password: 'admin'
};
let espCredentials = {
    username: 'admin',
    password: 'admin'
};


new DeviceManager().init('mongodb://localhost:27017/hive').then(manager => {
    let api = new HiveApi(manager, apiCredentials);
    let monitor = new HiveMonitor({
        credentials: espCredentials,
        manager,
        frequency: monitoringDelay,
        logger: console.log
    });
    manager.setSensor(
        { name: 'hiveTemperature', displayName: 'Hive temperature' },
        { name: 'piloTemperature', displayName: 'Pilo temperature' },
        { name: 'light', displayName: 'Light' },
        { name: 'humidity', displayName: 'Humidity' }
    );
    manager.setDevice(
        ['hiveTemperature', 'piloTemperature', 'light', 'humidity'],
        { name: 'hive0', endpoints: {
            sensors: 'http://192.168.43.82/sensors',
            lock: 'http://192.168.43.82/lock',
            unlock: 'http://192.168.43.82/unlock',
            update: 'http://192.168.43.82/update'
        }, location: 'Sofia', displayName: 'Hive 0' }
        // { name: 'hive1', url: '0.0.0.1', location: 'Sofia', displayName: 'Hive 1' }
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
```
