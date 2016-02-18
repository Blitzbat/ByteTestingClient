var io = require('socket.io-client');
var q = require('q');
var NodeZip = require('node-zip');
var glob = require('glob');
var path = require('path');
var fs = require('fs');

function Client(config) {

    this.config = config;
    this.socket = null;

    this.connect = function () {
        var d = q.defer();

        this.socket = io(this.config.controlServerUrl)
        this.socket.on('connect', function () {
            d.resolve();
        });

        this.socket.on('connect_error', function (err) {
            d.reject("Failed to connect to control server");
        });

        return d.promise;
    };

    this.sendTestSuite = function (pattern) {
        var self = this;
        var d = q.defer();
        var specPath = path.join(process.cwd(), pattern);

        glob(specPath, function (err, files) {
            if (files.length > 0) {
                var zip = new NodeZip();
                console.log("Adding files to suite...");
                files.forEach(function (file) {
                    zip.file(path.basename(file), fs.readFileSync(file));
                    console.log("Added: " + file);
                });

                console.log("Packing...");
                var data = zip.generate({ base64: true, compression: 'DEFLATE' });

                console.log("Sending to control server...");
                self.socket.emit("startSession", data);

                console.log("Waiting for response...");
                self.socket.on("sessionInfo", function (message) {
                    d.resolve(message);
                });
            } else {
                d.reject("No files found");
            }
        });

        return d.promise;
    };
};

module.exports = Client;