'use strict';

var crypto = require('crypto'),
    fs = require('fs'),
    async = require('async'),
    _ = require('lodash');

var fcmp = exports;


function _validFileSync(file) {
    return (typeof file === 'string' && file.trim() !== '' && fs.existsSync(file) && fs.statSync(file).isFile());
}

function _validFile(file, callback) {
    async.series([

        function (callback) {
            callback(typeof file !== 'string' || file.trim() === '');
        },
        function (callback) {
            fs.exists(file, function (exists) {
                callback(!exists);
            });
        },
        function (callback) {
            fs.stat(file, function (err, stats) {
                callback(err || !stats.isFile());
            });
        }
    ], function (err) {
        callback(err ? new Error('invalid file') : null);
    });
}


fcmp.algo = 'sha1';

fcmp.setAlgo = function (algo) {
    if (algo && _.indexOf(crypto.getHashes(), algo) !== -1) {
        fcmp.algo = algo;
    }
    return this.algo === algo;
};

fcmp.checksumSync = function (file) {
    if (!_validFileSync(file)) return null;

    var hasher = crypto.createHash(this.algo);

    return hasher.update(fs.readFileSync(file)).digest('hex');
};

fcmp.checksum = function (file, callback) {
    if (typeof callback !== 'function') return;

    async.waterfall([

        function (callback) {
            _validFile(file, function (err) {
                callback(err);
            });
        }, 
        (function (callback) {

            var hasher = crypto.createHash(this.algo),
                fReadStream = fs.createReadStream(file);

            hasher.setEncoding('hex');
            fReadStream.on('end', function () {
                hasher.end();
                callback(null, hasher.read());
            }).
            on('error', function (err) {
                callback(err);
            });

            fReadStream.pipe(hasher);
        }).bind(fcmp)
    ], function (err, checksum) {
        callback(err, checksum);
    });
};

fcmp.compareSync = function (fileOne, fileTwo) {
    return this.checksumSync(fileOne) === this.checksumSync(fileTwo);
};

fcmp.compare = function (fileOne, fileTwo, callback) {
    if (typeof callback !== 'function') return;

    async.map([fileOne, fileTwo], (this.checksum).bind(fcmp), function (err, results) {
        callback(err, (typeof results[0] === 'string' && results[0] === results[1]));
    });
};
