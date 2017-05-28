const request = require('request-promise');


module.exports.HiveMonitor = class {
    constructor(repository, frequency = 5000, logger = (_ = {})) {
        this.repository = repository;
        this.frequency = frequency;
        this.intervalId = undefined;
        this.logger = logger;
    }

    start() {
        this.stop();
        let devices = this.repository.getAllDevices();

        this.intervalId = setInterval(() => {
            for (let name in devices) {
                let device = devices[name];
                device.name = name;
                this.collectDeviceData(device);
            }
        }, this.frequency);
    }

    stop() {
        clearInterval(this.intervalId);
    }

    collectDeviceData({ url, displayName, name: deviceName }) {
        this.logger(`Start collecting data for ${ deviceName }`);
        request({ method: 'GET', url })
            .then(response => {
                let sensorsData = JSON.stringify(response);
                for (let sensorName in sensorsData) {
                    this.repository.addSensorData(
                        deviceName, sensorName,
                        sensorsData[sensorName], new Date()
                    );
                }
                this.logger(`Data for ${ deviceName } successfully collected`);
            })
            .catch(error => {
                this.logger(`Error in connecting to device ${ deviceName } (${ error })`);
            });
    }
}
