const express = require('express');
const app = express();
const bodyParser = require('body-parser');
let router = express.Router();


module.exports.HiveApi = class {
    constructor(repository) {
        // Config the server
        app.use(bodyParser.urlencoded({ extended: true }));
        app.use(bodyParser.json());
        app.use('/', router);
        app.use(function(err,req,res,next) {
            console.log(err.stack);
            res.status(500).send({ success: false, message: err.message });
        });

        let success = { success: true };

        // Devices
        router.get('/hive', function (req, res) {
            res.send(repository.getAllDevices());
        });

        router.post('/hive', function (req, res) {
            repository.setDevice(req.body.sensorNames, req.body);
            res.send(success);
        });

        router.get('/hive/:hiveName', function (req, res) {
            res.send(repository.getDevice(req.params.hiveName));
        });

        router.get('/hive/:hiveName/sensors', function (req, res) {
            res.send(repository.getDevice(req.params.hiveName).sensors);
        });

        router.get('/hive/:hiveName/sensors/:sensorName', function (req, res) {
            res.send(repository.getDevice(req.params.hiveName).sensors[req.params.sensorName]);
        });

        router.post('/hive/:hiveName/sensors/:sensorName', function (req, res) {
            res.send(repository.addSensorToDevice(req.params.hiveName, req.params.sensorNames));
        });


        // Sensors
        router.get('/sensor', function (req, res) {
            res.send(repository.getAllSensors());
        });

        router.post('/sensor', function (req, res) {
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
