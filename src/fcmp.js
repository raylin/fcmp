'use strict';

import crypto from 'crypto';
import fs from 'fs';
import glob from 'glob';

const HASH_ALGOS = crypto.getHashes();

let options = {
  _algorithm: 'sha1',
  get algorithm() {
    return this._algorithm || 'sha1';
  },
  set algorithm(algo) {
    if (HASH_ALGOS.indexOf(algo) !== -1) {
      this._algorithm = algo;
    }
  }
};

class Deferred {
  constructor() {
    this.promise = new Promise((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}

/**
 * Validate stream is right type and readable
 *
 * @param {*} obj - any type of obj
 *
 * @return {Boolean} - is valid stream
 */
function _isReadable(obj) {
  return obj &&
    typeof obj._read === 'function' &&
    typeof obj._readableState === 'object';
}

/**
 * Convert src to readable stream
 *
 * @param {*} src - glob or readable stream or something
 *
 * @return {Stream} - readable stream
 */
function _src2Stream(src) {
  let def = new Deferred();

  if (typeof src === 'string') {
    glob(src, {nodir: true}, (err, files) => {
      if (err) {
        def.reject(err);
      }
      def.resolve(files.map(f => {
        return fs.createReadStream(f);
      }));
    });
  } else if (_isReadable(src)) {
    def.resolve([src]);
  } else {
    def.reject();
  }

  return def.promise;
}

/**
 * Calculate checksum from stream
 *
 * @param {Stream} rs - readable stream
 *
 * @return {string} - hash value
 */
function _stream2Checksum(rs) {
  let def = new Deferred();
  let hasher = crypto.createHash(options.algorithm);

  rs.on('readable', () => {
    let data = rs.read();

    if (data) {
      hasher.update(data);
    } else {
      def.resolve({
        name: rs.path ||
          `file-${crypto.randomBytes(Math.ceil(4)).toString('hex')}`,
        hash: hasher.digest('hex')
      });
    }
  }).on('error', def.reject);

  return def.promise;
}

/**
 * Get checksum from globs or read streams
 *
 * @param {...obj} args - globs or streams
 * @return {string[]} - hashes of sources
 */
function fcmp(...args) {
  let fcmpP = Promise.all(args.map(_src2Stream))
  .then(rsArys => {
    return Promise.all(
      rsArys
      .reduce((pv, cv) => {
        return pv.concat(cv);
      }).map(rs => {
        return _stream2Checksum(rs);
      })
    );
  })
  .then(chksObjs => {
    let def = new Deferred();

    if (chksObjs.length) {
      def.resolve(chksObjs);
    } else {
      def.reject(new Error('Invalid input'));
    }

    return def.promise;
  });

  let _isSame = function _isSame() {
    return fcmpP.then(chksObjs => {
      let hashSet = new Set();

      chksObjs.map(co => {
        return co.hash;
      }).forEach(Set.prototype.add.bind(hashSet));

      return hashSet.size === 1;
    });
  };

  let _getChecksum = function _getChecksum() {
    return fcmpP.then(chksObjs => {
      return chksObjs.reduce((pv, cv) => {
        pv[cv.name] = cv.hash;

        return pv;
      }, {});
    });
  };

  let _getDuplicate = function _getDuplicate() {
    return fcmpP.then(chksObjs => {
      let dupTable = chksObjs.reduce((pv, cv) => {
        if (!pv[cv.hash]) {
          pv[cv.hash] = new Set();
        }
        pv[cv.hash].add(cv.name);

        return pv;
      }, {});

      let result = [];
      for (let hash in dupTable) {
        if (dupTable[hash].size > 1) {
          result.push(Array.from(dupTable[hash]));
        }
      }

      return result;
    });
  };

  return {
    isSame: _isSame,
    getChecksum: _getChecksum,
    getDuplicate: _getDuplicate
  };
}

fcmp.options = options;

export default fcmp;
