'use strict';

var crypto = require('crypto'),
    fs = require('fs'),
    async = require('async'),
    _ = require('lodash');

var fcmp = exports;


function _validFile(file) {
    return (typeof file === 'string' && fs.existsSync(file) && fs.statSync(file).isFile());
}


fcmp.algo = 'sha1';

fcmp.setAlgo = function (algo) {
    if (algo && _.indexOf(crypto.getHashes(), algo) !== -1) {
        fcmp.algo = algo;
    }
    return fcmp.algo === algo;
};

fcmp.checksumSync = function (file) {
    if (!_validFile(file)) return null;

    var hasher = crypto.createHash(this.algo);

    return hasher.update(fs.readFileSync(file)).digest('hex');
};

fcmp.checksum = function (file, callback) {
    if (!_validFile(file)) {
        callback(new Error('invalid file'), null);
        return;
    }

    async.waterfall([

        function readFile(callback) {
            fs.readFile(file, function (err, data) {
                callback(err, data);
            });
        }, (function checksum(data, callback) {
            var hasher = crypto.createHash(this.algo);

            callback(null, hasher.update(data).digest('hex'));
        }).bind(fcmp)
    ], function (err, hash) {
        callback(err, hash);
    });
};

fcmp.compareSync = function (fileOne, fileTwo) {
    return this.checksumSync(fileOne) === this.checksumSync(fileTwo);
};

fcmp.compare = function (fileOne, fileTwo, callback) {
    async.map([fileOne, fileTwo], this.checksum, function (err, results) {
        callback(err, results[0] === results[1]);
    });
};
