function selectDb(address, dbName) {

}

module.exports.HiveRepository = class {
    constructor(db) {
        this.db = {
            sensors: {},
            devices: {}
        };
    }

    init(address = 'mongodb://localhost:27017', dbName = 'hive') {
        selectDb(address, dbName);
        return this;
    }

    setSensor(...sensors) {
        sensors.forEach(({ name = 'unnamed', displayName = 'unnamed' }) =>
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

    // setSensorConfig(...configs) {
    //     configs.forEach(({ name, sensorNames }) =>
    //         this.db.sensorConfigs[name] = sensorNames);
    //     return this;
    // }

    // getSensorConfig(name) {
    //     if (!this.db.sensorConfigs[name]) {
    //         throw new Error(`No sensor configuration with the name ${ name }`);
    //     }
    //     return this.db.sensorConfigs[name];
    // }

    // getAllConfigs() {
    //     return this.db.sensorConfigs;
    // }

    setDevice(sensorNames = 'all', ...devices) {
        let sensors = {};
        if (sensorNames == 'all') {
            sensorNames = [];
            for (let name in this.getAllSensors()) {
                sensorNames.push(name);
            }
        }

        sensorNames.forEach(sensorName => {
            let sensor = this.getSensor(sensorName);
            sensors[sensorName] = [];
        });

        devices.forEach(({ name = 'unnamed', url = '0.0.0.0', location = 'no location', displayName = 'unnamed' }) =>
            this.db.devices[name] = { url, location, sensors, displayName });

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
