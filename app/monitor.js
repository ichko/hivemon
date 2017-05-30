const request = require('request-promise');


module.exports.HiveMonitor = class {
    constructor({ repository, frequency = 5000, logger = (_ = {}), credentials }) {
        this.repository = repository;
        this.frequency = frequency;
        this.intervalId = undefined;
        this.logger = logger;
        this.credentials = credentials;
    }

    start() {
        this.stop();
        this.repository.getAllDevices()
            .then(devices =>
                this.intervalId = setInterval(() =>
                    devices.forEach(device => this.collectDeviceData(device)),
                    this.frequency
                )
            )
            .catch(error => this.stop());
    }

    stop() {
        clearInterval(this.intervalId);
    }

    getHeaders() {
        // Format credentials
        return this.credentials;
    }

    collectDeviceData({ url, displayName, name: deviceName }) {
        this.logger(`Start collecting data for ${ deviceName }`);
        request({ headers: this.getHeaders(), method: 'GET', url })
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
