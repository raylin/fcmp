'use strict';

import crypto from 'crypto';
import fs from 'fs';
import glob from 'glob';

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
 * @private
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
 * @private
 * @param {*} src - glob or readable stream or something
 *
 * @return {Stream} - readable stream
 */
function _src2Stream(src) {
  const def = new Deferred();

  if (typeof src === 'string') {
    glob(src, { nodir: true }, (err, files) => {
      if (err) {
        return def.reject(err);
      }

      return def.resolve(files.map(f => fs.createReadStream(f)));
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
 * @private
 * @param {Stream} rs - readable stream
 *
 * @return {string} - hash value
 */
function _stream2Checksum(rs, algo) {
  const def = new Deferred();
  const hasher = crypto.createHash(algo);

  rs.on('readable', () => {
    const data = rs.read();

    if (data) {
      hasher.update(data);
    } else {
      def.resolve(hasher.digest('hex'));
    }
  }).on('error', def.reject);

  return def.promise;
}

/**
 * Return whether files are the same
 *
 * @param {...obj} args - globs or streams
 * @return {Boolean} - are the same or not
 */
function fcmp(...args) {
  return Promise.all(args.map(_src2Stream))
  .then(rsArys => Promise.all(
      rsArys
      .reduce((pv, cv) => pv.concat(cv))
      .map(rs => _stream2Checksum(rs, 'sha1'))
    )
  )
  .then(chksObjs => {
    const def = new Deferred();

    if (chksObjs.length) {
      def.resolve(chksObjs);
    } else {
      def.reject(new Error('Invalid input'));
    }

    return def.promise;
  })
  .then(chksObjs => {
    const hashSet = new Set();

    chksObjs.forEach(Set.prototype.add.bind(hashSet));

    return hashSet.size === 1;
  });
}

export default fcmp;
