let mongoose = require('mongoose');


// Fixing mongoose deprecated Promises library
mongoose.Promise = global.Promise;

module.exports.DeviceManager = class {
    constructor(db) {
        this.db = {
            sensors: {},
            devices: {}
        };
        this.sensorsProjection = { _id: 0, name: 1, displayName: 1 };
        this.devicesProjection = { _id: 0, name: 1, url: 1, location: 1, displayName: 1, sensors: 1 };
    }

    init(address) {
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
                sensors: [{
                    name: String,
                    values: [{ data: String, date: Date }]
                }]
            }))
        };
    }

    setSensor(...sensors) {
        return Promise.all(sensors.map(({ name = 'unnamed', displayName = 'unnamed' }) =>
            this.model.Sensor.findOneAndUpdate({ name }, { name, displayName }, { upsert: true })));
    }

    getSensor(name) {
        return this.model.Sensor.findOne({ name }, this.sensorsProjection);
    }

    deleteSensor(name) {
        return this.model.Sensor.findOneAndRemove({ name });
    }

    getAllSensors() {
        return this.model.Sensor.find({}, this.sensorsProjection);
    }

    setDevice(sensorNames = 'all', ...devices) {
        // TODO: Fix sensor names
        sensorNames = 'all';
        return new Promise((resolve, reject) => {
            this.getAllSensors()
                .then(sensors => {
                    devices.forEach(({
                        name = 'unnamed',
                        url = '0.0.0.0',
                        location = 'no location',
                        displayName = 'unnamed'
                    }) => {
                        let deviceSensors = [];
                        sensors.forEach(({ name: sensorName }) =>
                            deviceSensors.push({ name: sensorName, values: [] }));
                        this.model.Device.findOneAndUpdate(
                            { name },
                            { name, url, location, displayName, deviceSensors },
                            { upsert: true }
                        ).then(resolve).catch(reject);
                    });
                }).catch(reject);
        });
    }

    addSensorToDevice(deviceName, sensorName)  {
        return new Promise((resolve, reject) =>
            Promise.all(this.getSensor(sensorName), this.getDevice(this.deviceName)
                .then(([ { name: sensorName }, { name: deviceName } ]) =>
                    this.model.Device.update(
                        { name: deviceName },
                        { $push: { deviceSensors: { name: sensorName, values: [] } } }
                    ).then(resolve).catch(reject)
                ).catch(reject)));
    }

    getSensorFromDevice(deviceName, sensorName) {
        return new Promise((resolve, reject) =>
            repository.getDevice(req.params.hiveName)
                .then(device => {
                    // TODO: Refactor :(
                    let sensor = device.sensors
                        .find(({ name: dbSensorName }) => dbSensorName == sensorName);
                    sensor ? resolve(sensor) : reject(fail(`Sensor was not found`));
                })
                .catch(reject));
    }

    addSensorData(deviceName, sensorName, data, date = new Date()) {
        return this.model.Device.findOneAndUpdate({ name: deviceName, sensors: { name: sensorName } },
            { $push: { 'sensors.$.values': { data, date } } });
    }

    getDevice(name) {
        return this.model.Device.findOne({ name }, this.devicesProjection);
    }

    getAllDevices() {
        return this.model.Device.find({}, this.devicesProjection);
    }
}
