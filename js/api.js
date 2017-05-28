const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const router = express.Router();

const SECRET_KEY = 'THIS IS MY SECRET';

let getToken = user => jwt.sign(user, SECRET_KEY, { expiresIn: 60 * 60 }); // One hour token
let verifyToken = (token, callback) => jwt.verify(token, SECRET_KEY, callback);

let success = { success: true };
let fail = message => ({ success: false, message });

let credentials = {
    username: 'admin',
    password: 'admin'
};

module.exports.HiveApi = class {
    constructor(repository) {
        // Config the server
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());

        app.get('/authenticate', (req, res) => {
            let { username, password } = req.body;
            if (username == credentials.username, password = credentials.password) {
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
            res.send(repository.getAllDevices());
        });

        router.post('/hive', (req, res) => {
            repository.setDevice(req.body.sensorNames, req.body);
            res.send(success);
        });

        router.get('/hive/:hiveName', (req, res) => {
            res.send(repository.getDevice(req.params.hiveName));
        });

        router.get('/hive/:hiveName/sensors', (req, res) => {
            res.send(repository.getDevice(req.params.hiveName).sensors);
        });

        router.get('/hive/:hiveName/sensors/:sensorName', (req, res) => {
            res.send(repository.getDevice(req.params.hiveName).sensors[req.params.sensorName]);
        });

        router.post('/hive/:hiveName/sensors/:sensorName', (req, res) => {
            res.send(repository.addSensorToDevice(req.params.hiveName, req.params.sensorNames));
        });

        router.get('/hive/:hiveName/toggleDoor', (req, res) => {
            res.send(repository.addSensorToDevice(req.params.hiveName, req.params.sensorNames));
        });


        // Sensors
        router.get('/sensor', (req, res) => {
            res.send(repository.getAllSensors());
        });

        router.post('/sensor', (req, res) => {
            repository.setSensor(req.body);
            res.send(success);
        });
    }

    start(port = 3000) {
        app.listen(port, () => {
            // console.log(`API listening on port ${ port }`);
        });
    }
}
