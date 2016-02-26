'use strict';

import crypto from 'crypto';
import fs from 'fs';
import {Stream} from 'stream';
import glob from 'glob';

/**
 * Validate stream is right type and readable
 *
 * @param {*} obj - any type of obj
 *
 * @return {Boolean} - is valid stream
 */
function _isStream(obj) {
  return obj && obj instanceof Stream &&
    typeof obj._read === 'function' && typeof obj._readableState === 'object';
}

/**
 * Convert src to readable stream
 *
 * @param {*} src - glob or readable stream or something
 *
 * @return {Stream} - readable stream
 */
function _src2Stream(src) {
  return new Promise((resolve, reject) => {
    if (typeof src === 'string') {
      glob(src, {nodir: true}, (err, files) => {
        if (err || !files.length) {
          reject(err);
        }
        resolve(files.map(f => {
          return fs.createReadStream(f);
        }));
      });
    } else if (_isStream(src)) {
      resolve([src]);
    } else {
      reject();
    }
  });
}

/**
 * Calculate checksum from stream
 *
 * @param {Stream} rs - readable stream
 * @param {string} [algo=sha1] - hash algorithm
 *
 * @return {string} - hash value
 */
function _stream2Checksum(rs, algo = 'sha1') {
  return new Promise((resolve, reject) => {
    let hasher = crypto.createHash(algo);

    hasher.setEncoding('hex');
    rs
    .on('end', () => {
      hasher.end();
      resolve(hasher.read());
    })
    .on('error', reject);

    rs.pipe(hasher);
  });
}

/**
 * Get checksum from globs or read streams
 *
 * @param {...obj} args - globs or streams
 * @return {string[]} - hashes of sources
 */
function _checksum(...args) {
  return Promise.all(args.map(_src2Stream))
  .then(rsArys => {
    return rsArys.reduce((pv, cv) => {
      return pv.concat(cv);
    });
  })
  .then(rss => {
    return Promise.all(rss.map(rs => {
      return _stream2Checksum(rs);
    }));
  });
}

/**
 * Compare all and check if they have same content
 *
 * @param {...obj} args - globs or streams
 * @return {Boolean} - same or not
 */
export default function compare(...args) {
  let hashSet = new Set();

  return _checksum(...args)
  .then(chkss => {
    chkss.forEach(Set.prototype.add.bind(hashSet));

    return hashSet.size === 1;
  });
}
