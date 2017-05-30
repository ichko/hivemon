const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();


const SECRET_KEY = 'THIS IS MY SECRET';
const getToken = user => jwt.sign(user, SECRET_KEY, { expiresIn: 60 * 60 * 8 }); // Eight hour token
const verifyToken = (token, callback) => jwt.verify(token, SECRET_KEY, callback);
const success = { success: true };
const fail = message => ({ success: false, message });


module.exports.HiveApi = class {
    constructor(repository, adminCredentials) {
        // Config the server
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        app.post('/authenticate', (req, res) => {
            let { username, password } = req.body;
            if (username == adminCredentials.username &&
                password == adminCredentials.password) {
                res.send({ success: true, token: getToken(req.body) });
            } else {
                res.send(fail(`Incorrect authentication`));
            }
        });

        router.use((req, res, next) => {
            let token = req.body.token || req.headers['token'];
            verifyToken(token, err => {
                if (err) {
                    res.status(500).send(fail(`Unauthorized`));
                } else {
                    next();
                }
            });
        });

        app.use('/', router);
        app.use((err, req, res, next) => {
            res.status(500).send(fail(err.message));
        });

        // Devices
        router.get('/hive', (req, res) => {
            repository.getAllDevices()
                .then(devices => res.send(devices))
                .catch(error => fail(`Devices could not be retrieved (${ error })`));
        });

        router.post('/hive', (req, res) => {
            repository.setDevice(req.body.sensorNames, req.body)
                .then(() => res.send(success))
                .catch(error => res.send(fail(`Data was not saved (${ error })`)));
        });

        router.get('/hive/:hiveName', (req, res) => {
            repository.getDevice(req.params.hiveName)
                .then(device => res.send(device))
                .catch(error => res.send(fail(`Device ${ req.params.hiveName } could not be retrieved (${ error })`)));
        });

        router.get('/hive/:hiveName/sensor/:sensorName', (req, res) => {
            repository.getSensorFromDevice(req.params.hiveName, req.params.sensorName)
                .then(sensor => res.send(sensor))
                .catch(error => res.send(fail(`Data was not retrieved (${ error })`)));
        });

        router.post('/hive/:hiveName/sensor/:sensorName', (req, res) => {
            repository.addSensorToDevice(req.params.hiveName, req.params.sensorNames)
                .then(() => res.send(success))
                .catch(error => res.send(fail(`Sensor was not added (${ error })`)));
        });

        router.get('/hive/:hiveName/toggleDoor', (req, res) => {
            res.send(repository.addSensorToDevice(req.params.hiveName, req.params.sensorNames));
        });


        // Sensors
        router.get('/sensor', (req, res) => {
            repository.getAllSensors()
                .then(sensors => res.send(sensors))
                .catch(error => res.send(fail(`Sensors could not be retrieved (${ error })`)));
        });

        router.post('/sensor', (req, res) => {
            repository.setSensor(req.body)
                .then(() => res.send(success))
                .catch(error => res.send(fail(`Sensor could not be saved (${ error })`)));
        });

        router.delete('/sensor/:sensorName', (req, res) => {
            repository.deleteSensor(req.params.sensorName)
                .then(() => res.send(success))
                .catch(error => res.send(fail(`Sensor could not be deleted (${ error })`)));
        });
    }

    start(port = 3000) {
        app.listen(port, () => {
            // console.log(`API listening on port ${ port }`);
        });
    }
}
