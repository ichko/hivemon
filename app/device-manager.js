const mongoose = require('mongoose');
const request = require('request-promise');

// Fixing mongoose deprecated Promises library
mongoose.Promise = global.Promise;

module.exports.DeviceManager = class {
    constructor() {
        this.db = {
            devices: {}
        };
        this.sensorsProjection = { name: 1, displayName: 1, _id: 0 };
    }

    init(address = 'mongodb://localhost:27017/hive') {
        return new Promise((resolve, reject) => {
            mongoose.connect(address, error =>
                error ? reject(error) : this.registerSchemas() || resolve(this));
        });
    }

    registerSchemas() {
        this.model = {
            Sensor: mongoose.model('Sensor', new mongoose.Schema({
                name: String,
                displayName: String
            })),
            Device: mongoose.model('Device', new mongoose.Schema({
                name: String,
                url: String,
                location: String,
                displayName: String,
                sensors: Object
            }))
        };
    }

    setSensor(...sensors) {
        return Promise.all(sensors.map(({ name = 'unnamed', displayName = 'unnamed' }) =>
            this.model.Sensor.findOneAndUpdate({ name }, { name, displayName }, { upsert: true })));
    }

    getSensor(name) {
        return this.model.Sensor.find({ name }, this.sensorsProjection);
    }

    deleteSensor(name) {
        return this.model.Sensor.findOneAndRemove({ name });
    }

    getAllSensors() {
        return this.model.Sensor.find({}, this.sensorsProjection);
    }

    setDevice(sensorNames, ...devices) {
        devices.forEach(({
            name = 'unnamed',
            endpoints = { sensors: '0.0.0.0', lock: '0.0.0.0', unlock: '0.0.0.0' },
            location = 'no location',
            displayName = 'unnamed'
        }) => {
            let sensors = {};
            sensorNames.forEach(sensorName => {
                let sensor = this.getSensor(sensorName);
                sensors[sensorName] = [];
            });

            this.db.devices[name] = { endpoints, location, sensors, displayName };
        });

        return this;
    }

    addSensorToDevice(deviceName, sensorName)  {
        let device = this.getDevice(deviceName);
        let sensor = this.getSensor(sensorName);
        device.sensors[sensorName] = [];

        return this;
    }

    addSensorData(deviceName, sensorName, data, date = new Date()) {
        let device = this.getDevice(deviceName);
        if (device.sensors[sensorName]) {
            device.sensors[sensorName].push({ data, date });
        } else {
            throw new Error(`Sensor '${ sensorName }' not found for device '${ deviceName }'`);
        }

        return this;
    }

    updateDevice(deviceName) {
        let { endpoints } = this.getDevice(deviceName);
        return request.get(endpoints.update);
    }

    setDeviceLock(deviceName, value) {
        let { endpoints } = this.getDevice(deviceName);
        if (value) {
            return request.get(endpoints.lock);
        }
        return request.get(endpoints.unlock);
    }

    getDevice(name) {
        if (!this.db.devices[name]) {
            throw new Error(`No device with the name ${ name }`);
        }
        return this.db.devices[name];
    }

    getAllDevices() {
        return this.db.devices;
    }
}
