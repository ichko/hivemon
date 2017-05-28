let { HiveRepository } = require('./hive-repository');
let { HiveMonitor } = require('./hive-monitor');


let repository = new HiveRepository();
let monitor = new HiveMonitor(repository, 5000, console.log);

repository
    .setSensor(
        { name: 'hiveTemperature', displayName: 'Hive temperature' },
        { name: 'piloTemperature', displayName: 'Pilo temperature' },
        { name: 'light', displayName: 'Light' },
        { name: 'humidity', displayName: 'Humidity' }
    )
    .setSensorConfig({
        name: 'generalConfig',
        sensorNames: ['hiveTemperature', 'piloTemperature', 'light', 'humidity' ]
    })
    .setDevice(
        'generalConfig',
        { name: 'hive0', url: '0.0.0.0', location: 'Sofia', displayName: 'Hive 0' },
        { name: 'hive1', url: '0.0.0.1', location: 'Sofia', displayName: 'Hive 1' }
    );

console.log(`Monitoring initiated...`);
monitor.start();
