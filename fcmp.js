'use strict';

var crypto = require('crypto'),
    fs = require('fs'),
    async = require('async');


function chkCallback(cb) {
    return (cb && typeof cb === 'function') ? cb : function () {
        if (process.env.NODE_DEBUG) {
            throw new Error('missing callback');
        }
    };
}

var fcmp = exports;

fcmp.algo = 'sha1';

fcmp.setAlgo = function (algo) {
    if (algo && crypto.getHashes().indexOf(algo) !== -1) {
        fcmp.algo = algo;
    }
    return this.algo === algo;
};

fcmp.checksumSync = function (file) {
    var hasher = crypto.createHash(this.algo);

    return hasher.update(fs.readFileSync(file)).digest('hex');
};

fcmp.checksum = function (file, cb) {
    var callback = chkCallback(cb);

    var hasher = crypto.createHash(this.algo),
        fReadStream = fs.createReadStream(file);

    hasher.setEncoding('hex');
    fReadStream
        .on('end', function () {
            hasher.end();
            callback(null, hasher.read());
        })
        .on('error', function () {
            callback(new Error('file not exists'));
            return;
        });

    fReadStream.pipe(hasher);
};

fcmp.compareSync = function (fileOne, fileTwo) {
    return this.checksumSync(fileOne) === this.checksumSync(fileTwo);
};

fcmp.compare = function (fileOne, fileTwo, cb) {
    var callback = chkCallback(cb);

    async.map([fileOne, fileTwo], (this.checksum).bind(fcmp), function (err, results) {
        callback(err, (typeof results[0] === 'string' && results[0] === results[1]));
    });
};
