export class HiveRepository {
    constructor(db) {
        this.db = {
            sensors: {
                hiveTemperature: { displayName: 'Temperature' },
                piloTemperature: { displayName: 'Pilo Temperature' },
                light: { displayName: 'Light' },
                humidity: { displayName: 'Humidity' },
            },
            sensorConfig: {
                general: [ 'hiveTemperature', 'piloTemperature', 'light', 'humidity']
            },
            devices: {
                'Hive 0': { url: 'http://0.0.0.0/hive', location: 'Sofia', sensors: { light: { values: [] } } }
            }
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

    setSensorConfig(...configs) {
        configs.forEach(({ name, sensorNames }) =>
            this.db.sensorConfig[name] = sensorNames);
        return this;
    }

    getSensorConfig(name) {
        if (!this.db.sensorConfig[name]) {
            throw new Error(`No sensor configuration with the name ${ name }`);
        }
        return this.db.sensorConfig[name];
    }

    setDevice(sensorConfig, ...devices) {
        let sensors = {};
        sensorConfig.forEach(sensorName => {
            let sensor = this.getSensor(sensorName);
            sensors[sensorName] = { values: [] };
        });

        devices.forEach(({ name, url, location }) =>
            this.db.devices[name] = { url, location, sensors });
    }

    getDevice(name) {
        if (!this.db.devices[name]) {
            throw new Error(`No device with the name ${ name }`);
        }
        return this.db.devices[name];
    }
}
