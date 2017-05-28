var mongoClient = require('mongodb').MongoClient;


module.exports.DeviceManager = class {
    constructor(db) {
        this.db = {
            sensors: {},
            devices: {}
        };
        this.mongo = {};
    }

    init(address = 'mongodb://localhost:27017', dbName = 'hive') {
        return new Promise((resolve, reject) => {
            mongoClient.connect(`${address}/${dbName}`, (error, db) => {
                if (!error){
                    Promise.all([
                        db.createCollection('sensors'),
                        db.createCollection('devices')
                    ]).then(([sensors, devices]) => {
                        this.mongo.sensors = sensors;
                        this.mongo.devices = devices;
                        resolve(this);
                    });
                } else {
                    reject(error);
                }
            });
        });
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
        //return this.mongo.sensors.find({});
        return this.db.sensors;
    }

    setDevice(sensorNames = 'all', ...devices) {
        if (sensorNames == 'all') {
            sensorNames = [];
            for (let name in this.getAllSensors()) {
                sensorNames.push(name);
            }
        }

        devices.forEach(({
            name = 'unnamed',
            url = '0.0.0.0',
            location = 'no location',
            displayName = 'unnamed'
        }) => {
            let sensors = {};
            sensorNames.forEach(sensorName => {
                let sensor = this.getSensor(sensorName);
                sensors[sensorName] = [];
            });

            this.db.devices[name] = { url, location, sensors, displayName }
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
