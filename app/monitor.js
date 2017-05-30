const request = require('request-promise');


module.exports.HiveMonitor = class {
    constructor({ manager, frequency = 5000, logger = (_ = {}), credentials }) {
        this.manager = manager;
        this.frequency = frequency;
        this.intervalId = undefined;
        this.logger = logger;
        this.credentials = credentials;
    }

    start() {
        this.stop();
        let devices = this.manager.getAllDevices();

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

    getHeaders() {
        // Format credentials
        return {
            'Authorization': 'Basic YWRtaW46ZXNwODI2Ng=='
        };
    }

    collectDeviceData({ endpoints, displayName, name: deviceName }) {
        this.logger(`Start collecting data for ${ deviceName }`);
        request({ headers: this.getHeaders(), method: 'GET', url: endpoints.sensors })
            .then(response => {
                let sensorsData = JSON.parse(response);
                for (let sensorName in sensorsData) {
                    this.manager.addSensorData(
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
