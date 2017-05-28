module.exports = class HiveRepository {
    constructor(db) {
        this.db = {
            sensors: {},
            sensorConfigs: {},
            devices: {}
        };
    }

    setSensor(...sensors) {
        sensors.forEach(({ name, displayName }) =>
            this.db.sensors[name] = { displayName });
        return this;
    }

    getSensor(name) {
        if (!this.db.sensors[name]) {
            throw new Error(`No sensor with the name ${ name }`);
        }
        return this.db.sensors[name];
    }

    getAllSensors() {
        return this.db.sensors;
    }

    setSensorConfig(...configs) {
        configs.forEach(({ name, sensorNames }) =>
            this.db.sensorConfigs[name] = sensorNames);
        return this;
    }

    getSensorConfig(name) {
        if (!this.db.sensorConfigs[name]) {
            throw new Error(`No sensor configuration with the name ${ name }`);
        }
        return this.db.sensorConfigs[name];
    }

    getAllConfigs() {
        return this.db.sensorConfigs;
    }

    setDevice(sensorConfigName, ...devices) {
        let sensors = {};
        this.getSensorConfig(sensorConfigName).forEach(sensorName => {
            let sensor = this.getSensor(sensorName);
            sensors[sensorName] = { values: [] };
        });

        devices.forEach(({ name, url, location, displayName }) =>
            this.db.devices[name] = { url, location, sensors, displayName });

        return this;
    }

    addSensorData(deviceName, sensorName, data, date = new Date()) {
        let device = getDevice();
        if (device.sensors[sensorName]) {
            device.sensors[sensorName].push({ data, date });
        } else {
            throw new Error(`Sensor '${ sensorName }' not found for device '${ deviceName }'`);
        }
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
